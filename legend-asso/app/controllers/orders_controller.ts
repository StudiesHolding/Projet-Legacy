import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'

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
  async store({ auth, response, session }: HttpContext) {}
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
