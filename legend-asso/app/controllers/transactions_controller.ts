import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import env from '#start/env'

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

  public async initiateTransaction({ auth, response, session }: HttpContext) {
    const totalPrice = session.get('totalPrice')
    const newTransaction = await Transaction.create({
      buyerId: auth.user!.id,
      totalPrice: totalPrice,
      status: 'pending',
    })
    const savedTransaction = await newTransaction.save()

    const phoneNumber = auth.user?.phone.split(' ').join('')
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
          accountDetails: { phoneNumber: `237${phoneNumber}`, provider: 'ORANGE_CMR' },
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
      const res = await apiResponse.json()

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
          console.log(res)
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

  public async checkStatus({ params, response }: HttpContext) {
    console.log(`Checking status for transaction ID: ${params.id}`)
    const depositId = params.id

    try {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
      }

      // On utilise await pour attendre la réponse de l'API
      const apiResponse = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
      const res = await apiResponse.json()

      console.log('Statut actuel chez PawaPay:', res)

      // Ici vous pourrez ajouter la logique pour mettre à jour savedTransaction.status
      // si le statut est passé à 'SUCCESSFUL' ou 'FAILED'

      return response.ok(res)
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return response.internalServerError('Erreur de vérification')
    }
  }
}
