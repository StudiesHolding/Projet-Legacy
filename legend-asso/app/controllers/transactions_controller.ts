import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import env from '#start/env'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import mail from '@adonisjs/mail/services/main'
import OtpVerification from '#models/otp_verification'
import { DateTime } from 'luxon'

export default class TransactionsController {
  private get isSandbox() {
    return env.get('PAWAPAY_MODE') === 'sandbox'
  }

  private get PAWAPAY_KEY() {
    return this.isSandbox ? env.get('PAWAPAY_SANDBOX_KEY') : env.get('PAWAPAY_PRODUCTION_KEY')
  }

  private get PAWAPAY_URL() {
    return this.isSandbox ? env.get('PAWAPAY_SANDBOX_URL') : env.get('PAWAPAY_PRODUCTION_URL')
  }

  public async index() {
    console.log('Transactions index method called')
  }

  public generateOTP() {
    const otpCode = Math.floor(100000 + Math.random() * 900000)
    return otpCode
  }

  // Usage

  public async initiateTransaction({ auth, response, request, session }: HttpContext) {
    const payload = await request.all()
    const phoneNumber = payload.country_code + payload.phone_number
    const totalPrice = session.get('totalPrice')
    const newTransaction = await Transaction.create({
      buyerId: auth.user!.id,
      totalPrice: totalPrice,
      status: 'pending',
    })
    const savedTransaction = await newTransaction.save()

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.PAWAPAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositId: `${savedTransaction.id}`,
        payer: {
          type: 'MMO',
          accountDetails: { phoneNumber: `${phoneNumber}`, provider: 'ORANGE_CMR' },
        },
        amount: `${totalPrice}`,
        currency: 'XAF',
        preAuthorisationCode: 'juste',
        clientReferenceId: `CLIENT-${auth.user!.id}-TXN-${savedTransaction.id}`,
        customerMessage: 'Note of 4 to 22 chars',
        metadata: [{ orderId: 'ORD-123456789' }, { customerId: `${auth.user!.id}`, isPII: true }],
      }),
    }

    try {
      // 1. On attend la réponse de l'API (await est crucial ici)
      const apiResponse = await fetch(this.PAWAPAY_URL, options)
      const res: any = await apiResponse.json()

      console.log('Réponse pawapay:', res)
      switch (res.status) {
        case 'ACCEPTED':
          savedTransaction.status = 'accepted'
          await savedTransaction.save()
          console.log('transaction accepté par pawapay')
          response.redirect().toRoute('transaction.checkStatus', { id: savedTransaction.id })
          break
        case 'REJECTED':
          savedTransaction.status = 'refused'
          savedTransaction.note = res.failureReason.failureMessage
          await savedTransaction.save()
          console.log('transaction refusé par pawapay')
          break
        case 'DUPLICATE_IGNORED':
          savedTransaction.status = 'refused'
          savedTransaction.note = 'you cannot duplicate transactions'
          await savedTransaction.save()
          console.log(res)
          console.log('transaction refusé par pawapay')
          break
        default:
          console.log(options)
          savedTransaction.status = 'refused'
          savedTransaction.note = 'probleme bizzare'
          await savedTransaction.save()
          console.log('transaction refusé par pawapay')
          break
      }
    } catch (error) {
      console.error('Erreur lors de la requête de paiement:', error)
    }
  }

  public async checkStatus({ auth, params, response, session }: HttpContext) {
    const depositId = params.id
    try {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
      }

      const apiResponse: any = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
      if (!apiResponse.ok) {
        throw new Error(`Erreur HTTP: ${apiResponse.status}`)
      }
      const res = await apiResponse.json()
      const pawapayStatus = res.data.status

      if (pawapayStatus === 'COMPLETED') {
        const newOrder = await Order.create({
          status: 'pending',
          buyerId: auth.user?.id,
          totalPrice: res.data.amount,
          transactionId: res.data.depositId,
        })
        // creation du des orderItems
        const { items } = session.get('cart')

        for (const item of items) {
          await OrderItem.create({
            reference: item.id,
            quantity: item.quantity,
            status: 'pending',
            name: item.name,
            orderId: newOrder.id,
            priceAtPurchase: item.price,
            sellerId: item.sellerId,
          })
        }

        const otpCode = this.generateOTP()
        const user = await auth.authenticate()

        // Nettoie le panier
        session.forget('cart')
        session.forget('totalItems')
        session.forget('totalPrice')
        await mail.send((message) => {
          message
            .to(user.email)
            .from('onboarding@resend.dev')
            .subject('Verification de mail')
            .htmlView('mail/email-verification', { user, otpCode })
        })

        await OtpVerification.create({
          userId: user.id,
          otpValue: otpCode,
          expireAt: DateTime.now().plus({ minutes: 10 }),
        })

        console.log('mail envoyé')
        // redirection vers le dashboard
        return response.redirect().toRoute('dashboard-client', { transaction: 'success' })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      session.flash('error', 'Impossible de vérifier le statut de la transaction.')
      return response.redirect().toRoute('dashboard.client')
    }
  }
}
