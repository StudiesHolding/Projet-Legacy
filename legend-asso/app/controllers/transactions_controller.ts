import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import env from '#start/env'

export default class TransactionsController {
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
        'Authorization': `Bearer ${env.get('PAWAPAY_API_KEY')}`,
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
      const apiResponse = await fetch(env.get('PAWAPAY_API_SANDBOX_URL'), options)
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
        default:
          savedTransaction.status = 'refused'
          savedTransaction.note = 'you cannot duplicate transactions'
          await savedTransaction.save()
          console.log('transaction refusé par pawapay')
          break
      }
    } catch (error) {
      console.error('Erreur lors de la requête de paiement:', error)
    }
    console.log('Initiating a new transaction')
  }

  public async checkStatus({ params }: HttpContext) {
    console.log(`Checking status for transaction ID: ${params.id}`)
    const depositId = params.id
    try {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${env.get('PAWAPAY_API_KEY')}` },
      }

      fetch(`${env.get('PAWAPAY_API_SANDBOX_URL')}/${depositId}`, options)
        .then((res) => res.json())
        .then((res) => console.log(res))
        .catch((err) => console.error(err))
    } catch (error) {}
  }
}
