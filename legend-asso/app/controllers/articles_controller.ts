import Article from '#models/article'
import { ArticleValidator } from '#validators/article'
import { cuid } from '@adonisjs/core/helpers'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'
import Category from '#models/category'
import { AgrofoodValidator } from '#validators/agrofood'

export default class ArticlesController {
  /**
   * Display a list of resource
   */
  async index({ view, request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const user = await auth.authenticate()
    const articles = await Article.query()
      .orderBy('created_at', 'desc')
      .where('seller_id', user.id)
      .paginate(page, 12)
    articles.baseUrl('/article')

    const rangeMin = Math.max(1, articles.currentPage - 1)
    const rangeMax = Math.max(1, articles.currentPage + 1)

    const pagination = articles.getUrlsForRange(1, articles.lastPage).filter((item) => {
      if (item.page === 1 || item.page === articles.lastPage) {
        return true
      }
      return item.page >= rangeMin && item.page <= rangeMax
    })
    return view.render('pages/dashboard/seller/my-articles', {
      myArticles: articles,
      pagination: pagination,
    })
  }
  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    const categories = await Category.all()
    return view.render('pages/dashboard/seller/add_article_1', { categories })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ session, response }: HttpContext) {
    const stepOneData = session.get('stepOneData')
    const imagesPaths = session.get('stepOneImages')
    const stepTwoData = session.get('stepTwoData')

    if (!stepOneData) {
      return response.redirect().toRoute('article.create')
    }

    // 1. Créer l'Article de base d'abord
    const article = await Article.create(stepOneData)

    // 2. Créer l'extension Agrofood liée à l'article
    // On ne mélange plus les données, on sépare ce qui est spécifique
    await article.related('agrofood').create({
      certification: stepTwoData?.certification,
      ingredient_list: stepTwoData?.ingredient,
      expiry_date: stepTwoData?.expiry_date,
      conservation_advice: stepTwoData?.conservation_advice,
    })

    // 3. Gérer les images via la relation sur l'article
    if (imagesPaths && imagesPaths.length > 0) {
      const imagesToStore = imagesPaths.map((path: string) => ({ imageUrl: path }))
      await article.related('images').createMany(imagesToStore)
    }

    // Nettoyage de la session
    session.forget('stepOneData')
    session.forget('stepTwoData')
    session.forget('stepOneImages')

    session.flash('success', 'Votre article a été créé avec succès !')
    return response.redirect().toRoute('article.index')
  }

  async show({ params, view, response }: HttpContext) {
    const article = await Article.query().preload('images').where('id', params.id).first()
    if (!article) {
      return response.notFound('Article introuvable')
    }
    const categories = await Category.all()
    return view.render('pages/dashboard/seller/show_article', { article, categories })
  }

  async update({ params, request, response, auth, session }: HttpContext) {
    const article = await Article.query().where('id', params.id).firstOrFail()
    const user = await auth.authenticate()
    if (article.sellerId !== user.id) {
      return response.unauthorized('Action non autorisée.')
    }

    const payload = await request.validateUsing(ArticleValidator)
    article.merge({
      slug: string.slug(payload.name),
      name: payload.name,
      about: payload.about,
      categoryId: payload.category_id,
      price: payload.price,
      // measure: payload.measure,
      available: payload.available,
      delivery_time: payload.delivery_time,
    })
    await article.save()

    // Supprimer les images existantes
    await article.related('images').query().delete()

    // Gérer les nouvelles images
    const imagesToStore: { imageUrl: string }[] = []

    if (Array.isArray(payload.images)) {
      for (const imageFile of payload.images) {
        if (!imageFile.isValid) {
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

    session.flash('success', 'Article mis à jour avec succès.')
    return response.redirect().toRoute('article.index')
  }

  async destroy({ params, response, auth, session }: HttpContext) {
    const article = await Article.query().where('id', params.id).firstOrFail()
    const user = await auth.authenticate()

    if (article.sellerId !== user.id) {
      return response.unauthorized('Action non autorisée.')
    }

    await article.delete()

    session.flash('success', 'Article supprimé avec succès.')
    return response.redirect().toRoute('article.index')
  }

  async handleStepOne({ request, session, auth, view }: HttpContext) {
    const payload = await request.validateUsing(ArticleValidator)
    const slug = string.slug(payload.name)
    const user = await auth.authenticate()

    const imagesPaths: string[] = []
    if (payload.images) {
      for (const imageFile of payload.images) {
        const imageName = `${cuid()}.${imageFile.extname}`
        await imageFile.move(app.publicPath('uploads/articles'), { name: imageName })
        imagesPaths.push(`/uploads/articles/${imageName}`)
      }
    }

    // On stocke TOUT en session (données + chemins des images)
    session.put('stepOneData', {
      sellerId: user.id,
      name: payload.name,
      slug,
      delivery_time: payload.delivery_time,
      unit_value: payload.unit_value,
      unit_type: payload.unit_type,
      about: payload.about,
      categoryId: payload.category_id,
      price: payload.price,
      status: 'pending',
      available: true,
    })

    session.put('stepOneImages', imagesPaths)
    return view.render('pages/dashboard/seller/add_article_2')
  }

  async handleStepTwo({ request, response, session }: HttpContext) {
    const all = request.all()
    console.log(all)
    const payload = await request.validateUsing(AgrofoodValidator)
    console.log(payload)

    session.put('stepTwoData', payload)
    return await this.store({ session, response } as HttpContext)
  }
}
