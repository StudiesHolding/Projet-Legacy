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
  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    const articles = await Article.query().where('seller_id', user.id)
    return view.render('pages/dashboard/seller/my-articles', { myArticles: articles })
  }
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/dashboard/seller/add_article')
  }

  /**
   * Handle form submission for the create action
   */

  async store({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(ArticleValidator)

    const slug = string.slug(payload.name)
    const user = await auth.authenticate()
    const sellerId = user.id

    const article = await Article.create({
      seller_id: sellerId,
      status: 'pending',
      slug,
      name: payload.name,
      about: payload.about,
      category: payload.category,
      price: payload.price,
      measure: payload.measure,
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

  session.flash('notification', {
  type: 'success',
  message: 'Votre article a bien été soumis a la validation'

  })
  await article.load('images')
  return response.redirect().toRoute('article.index')
}

async show({ params, view, response }: HttpContext) {
  const article = await Article.query()
    .preload('images')
    .where('id', params.id)
    .first()

  if (!article) {
    return response.notFound('Article introuvable')
  }

  return view.render('pages/dashboard/seller/show_article', { article })
}

async update({ params, request, response, auth, session }: HttpContext) {
  const article = await Article.query().where('id', params.id).firstOrFail()

  if (article.seller_id !== user.id) {
    return response.unauthorized('Action non autorisée.')
  }

  const payload = await request.validateUsing(ArticleValidator)
  
  article.merge({
    slug: string.slug(payload.name),
    name: payload.name,
    about: payload.about,
    category: payload.category,
    price: payload.price,
    measure: payload.measure,
  })
  
  await article.save()

  session.flash('success', 'Article mis à jour avec succès.')
  return response.redirect().toRoute('article.index')
}

  async destroy({ params, response, auth, session }: HttpContext) {
    const article = await Article.query().where('id', params.id).firstOrFail()
    const user = await auth.authenticate()

    if (article.seller_id !== user.id) {
      return response.unauthorized('Action non autorisée.')
    }

    await article.delete()

    session.flash('success', 'Article supprimé avec succès.')
    return response.redirect().toRoute('article.index')
  }
}