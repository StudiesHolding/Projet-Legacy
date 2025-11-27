import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  /**
   * Display a list of resource
   */
  async index({view}: HttpContext) {
    return view.render('pages/dashboard/seller/my-articles')
  }
  /**
   * Display form to create a new record
   */
  async create({view}: HttpContext) {
    return view.render('pages/dashboard/seller/add_article')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const payload = request.only(['name', 'price', 'description', 'category', 'measure']);
    const image = request.files('images')
    
    const finalPayload = {...payload,...image}
    console.log(finalPayload)
    
  }

  /**
   * Show individual record
   */
  async show({ params , view }: HttpContext) {
    return view.render('')
  }

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