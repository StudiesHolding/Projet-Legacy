import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import env from '#start/env'
import axios from 'axios'

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
      headers: { 'api-key': env.get('LYGOS_API_KEY'), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalPrice,
        shop_name: 'Legend Asso Test',
        message: `Paiement pour commande ${savedOrder.id}`,
        success_url: 'http://localhost:3333',
        failure_url: 'http://localhost:3333/login',
        order_id: `CMD-2024-${savedOrder.id}`,
      }),
    }
    console.log('spaghetti.............................')

    // try {
    //   fetch('https://api.lygosapp.com/v1/gateway', options)
    //     .then((res) => res.json())
    //     .then((res) => {
    //       return response.redirect().toPath(res.link)
    //     }
    // } catch (error) {
    //   console.error('Error making payment request:', error)
    // }

    try {
      // 1. On attend la réponse de l'API (await est crucial ici)
      const apiResponse = await fetch('https://api.lygosapp.com/v1/gateway', options)
      const res = await apiResponse.json()

      console.log('Réponse Lygos:', res)

      // 2. On vérifie que le lien existe bien avant de rediriger
      if (res.link) {
        return response.redirect().toPath(res.link)
      } else {
        console.error('Lien de paiement manquant dans la réponse')
        return response.badRequest('Impossible de générer le lien de paiement')
      }
    } catch (error) {
      console.error('Erreur lors de la requête de paiement:', error)
      return response.internalServerError('Erreur de communication avec le service de paiement')
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
