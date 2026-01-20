import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import env from '#start/env'

export default class OrdersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    console.log('index................................................')
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {
    console.log('create................................................')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, response, session }: HttpContext) {
    const totalPrice = session.get('totalPrice')
    const newOrder = await Order.create({
      buyerId: auth.user!.id,
      totalPrice: totalPrice,
      status: 'pending',
    })
    const savedOrder = await newOrder.save()

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.get('PAWAPAY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositId: 'f4401bd2-1568-4140-bf2d-ec77deb2b637',
        payer: {
          type: 'MMO',
          accountDetails: { phoneNumber: '260763456789', provider: 'MTN_MOMO_ZMB' },
        },
        amount: '15000',
        currency: 'XAF',
        preAuthorisationCode: 'juste',
        clientReferenceId: 'INV-123456',
        customerMessage: 'Note of 4 to 22 chars',
        metadata: [{ orderId: 'ORD-123456789' }, { customerId: `${auth.user!.id}`, isPII: true }],
      }),
    }

    fetch(env.get('PAWAPAY_API_SANDBOX_URL'), options)
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err))

    try {
      // 1. On attend la réponse de l'API (await est crucial ici)
      const apiResponse = await fetch(env.get('PAWAPAY_API_SANDBOX_URL'), options)
      const res = await apiResponse.json()

      console.log('Réponse pawapay:', res)
    } catch (error) {
      console.error('Erreur lors de la requête de paiement:', error)
      // return response.internalServerError('Erreur de communication avec le service de paiement')
    }
  }
  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
