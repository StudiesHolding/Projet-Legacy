import Article from '#models/article'
import { ArticleValidator } from '#validators/article'
import { cuid } from '@adonisjs/core/helpers'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import string from '@adonisjs/core/helpers/string'
import Category from '#models/category'
import { AgrofoodValidator } from '#validators/agrofood'
import { LifestyleValidator } from '#validators/lifestyle'
import { CosmeticValidator } from '#validators/cosmetic'

export default class ArticlesController {
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

  async create({ view }: HttpContext) {
    const categories = await Category.all()
    return view.render('pages/dashboard/seller/add_article_1', { categories })
  }
  async store({ session, response }: HttpContext) {
    const stepOneData = session.get('stepOneData')
    const imagesPaths = session.get('stepOneImages')
    const stepTwoData = session.get('stepTwoData')
    const categoryName = session.get('selectedCategoryName')

    if (!stepOneData) {
      return response.redirect().toRoute('article.create')
    }

    console.log(stepTwoData)
    console.log(
      '.....................................................................................................................',
      stepTwoData
    )

    const article = await Article.create(stepOneData)
    if (categoryName === 'Agroalimentaire') {
      await article.related('agrofood').create({
        certification: stepTwoData?.certification,
        ingredient_list: stepTwoData?.ingredient,
        expiry_date: stepTwoData?.expiry_date,
        conservation_advice: stepTwoData?.conservation_advice,
      })
    } else if (categoryName === 'lifestyle') {
      await article.related('lifestyle').create({
        materials: stepTwoData?.materials,
        variants: stepTwoData?.variants,
        craftsmanship: stepTwoData?.craftsmanship,
        sizes: stepTwoData?.sizes,
        length: stepTwoData?.length,
        width: stepTwoData?.width,
        height: stepTwoData?.height,
        weight: stepTwoData?.weight,
        style: stepTwoData?.style,
        usage: stepTwoData?.usage,
      })
    } else if (categoryName === 'Cosmetique') {
      const newCosmetic = await article.related('cosmetic').create({
        precautions: stepTwoData?.precautions,
        skinType: stepTwoData?.skinType,
        texture: stepTwoData?.texture,
        capacity_value: stepTwoData?.capacity_value,
        capacity_unit: stepTwoData?.capacity_unit,
        ingredients: stepTwoData?.ingredients,
      })
      console.log(newCosmetic)
    }

    // 3. Gérer les images
    if (imagesPaths && imagesPaths.length > 0) {
      const imagesToStore = imagesPaths.map((path: string) => ({ imageUrl: path }))
      await article.related('images').createMany(imagesToStore)
    }

    // Nettoyage complet
    session.forget('stepOneData')
    session.forget('stepTwoData')
    session.forget('stepOneImages')
    session.forget('selectedCategoryName')
    session.flash('success', 'Votre article a été créé avec succès !')
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

    const category = await Category.findOrFail(payload.category_id)

    session.put('selectedCategoryName', category.name)
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

    return view.render('pages/dashboard/seller/add_article_2', { category: category.name })
  }

  async handleStepTwo({ request, response, session }: HttpContext) {
    let payload
    const categoryName = session.get('selectedCategoryName')
    if (categoryName === 'Agroalimentaire') {
      payload = await request.validateUsing(AgrofoodValidator)
    } else if (categoryName === 'Lifestyle') {
      payload = await request.validateUsing(LifestyleValidator)
    } else if (categoryName === 'Cosmetique') {
      payload = await request.validateUsing(CosmeticValidator)
    } else {
      return response.redirect().back()
    }
    session.put('stepTwoData', payload)
    return await this.store({ session, response } as HttpContext)
  }
}
