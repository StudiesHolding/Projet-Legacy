import Article from '#models/article';
import { ArticleValidator } from '#validators/article';
import { cuid } from '@adonisjs/core/helpers';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';
import string from '@adonisjs/core/helpers/string'


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

  async store({ request, auth, response }: HttpContext) {
  const payload = await request.validateUsing(ArticleValidator)

  const slug = string.slug(payload.name)
  const user = await auth.authenticate()
const sellerId = user.id

  const article = await Article.create({
    sellerId,
    status: 'pending',
    slug,
    name: payload.name,
  })

  const imagesToStore: { imageUrl: string }[] = []

  if (Array.isArray(payload.images)) {
    for (const imageFile of payload.images) {

      if (!imageFile.isValid) {
        console.log('Erreur upload :', imageFile.errors)
        continue
      }

      const imageName = `${cuid()}.${imageFile.extname}`
      const folder = app.publicPath('uploads/articles')

      await imageFile.move(folder, {
        name: imageName,
        overwrite: true,
      })

      imagesToStore.push({
        imageUrl: `/uploads/articles/${imageName}`,
      })
    }
  }

  if (imagesToStore.length > 0) {
    await article.related('images').createMany(imagesToStore)
  }

  await article.load('images')
  return response.created(article)
}
/**
 * Show individual record
 */
async show({ params , view }: HttpContext) {}

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

