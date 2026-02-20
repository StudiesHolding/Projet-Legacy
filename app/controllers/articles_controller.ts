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
import { updateArticleValidator } from '#validators/update_article'
import { DateTime } from 'luxon'
import ArticlePolicy from '#policies/article_policy'

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

  async edit({ params, view, auth, bouncer, response }: HttpContext) {
    const user = await auth.authenticate()

    // On récupère l'article avec toutes ses relations possibles
    const article = await Article.query()
      .where('id', params.id)
      .where('seller_id', user.id)
      .preload('images')
      .preload('agrofood')
      .preload('lifestyle')
      .preload('cosmetic')
      .preload('category')
      .firstOrFail()
    if (await bouncer.with('ArticlePolicy').denies('update', article)) {
      return response.forbidden()
    }

    const categories = await Category.all()
    return view.render('pages/dashboard/seller/edit-article', { categories, article })
  }

  async update({ request, params, response, session, auth, bouncer }: HttpContext) {
    const user = await auth.authenticate()
    const article = await Article.query()
      .where('id', params.id)
      .where('seller_id', user.id)
      .firstOrFail()
    if (await bouncer.with(ArticlePolicy).denies('update', article)) {
      return response.forbidden("Vous n'etes pas authorisé au modifier cet article")
    }
    // 1. Valider les données de base (ArticleValidator)
    const payload = await request.validateUsing(updateArticleValidator)
    const available = !!request.all().available

    // 2. Mettre à jour l'article de base
    article.merge({
      name: payload.name,
      slug: string.slug(payload.name),
      delivery_time: Number(payload.delivery_time),
      unit_value: payload.unit_value,
      unit_type: payload.unit_type,
      available: available,
      about: payload.about,
      categoryId: Number(payload.category_id),
      price: payload.price,
    })
    await article.save()

    // 3. Mettre à jour les données spécifiques selon la catégorie
    const category = await Category.findOrFail(payload.category_id)

    if (category.name === 'Agroalimentaire') {
      const specificData = await request.validateUsing(AgrofoodValidator)
      await article.related('agrofood').updateOrCreate(
        {},
        {
          certification: specificData.certification ?? undefined,
          ingredient_list:
            specificData.ingredient?.filter((item): item is string => item !== null) ?? undefined,
          expiry_date: specificData.expiration_date
            ? DateTime.fromJSDate(specificData.expiration_date)
            : undefined,
          conservation_advice: specificData.conservation_advice ?? undefined,
        }
      )
    } else if (category.name === 'lifestyle') {
      const specificData = await request.validateUsing(LifestyleValidator)
      await article.related('lifestyle').updateOrCreate(
        {},
        {
          ...specificData,
          length: specificData.length ?? undefined,
          width: specificData.width ?? undefined,
          height: specificData.height ?? undefined,
          weight: specificData.weight ?? undefined,
          materials: specificData.materials?.filter((m): m is string => m !== null),
          variants: specificData.variants?.filter((v): v is string => v !== null),
        }
      )
    } else if (category.name === 'Cosmetique') {
      const specificData = await request.validateUsing(CosmeticValidator)
      await article.related('cosmetic').updateOrCreate(
        {},
        {
          precautions: specificData.precautions,
          skinType: specificData.skinType,
          texture: specificData.texture,
          capacity_value: specificData.capacity_value,
          capacity_unit: specificData.capacity_unit,
          ingredients: specificData.ingredients,
        }
      )
    }

    // 4. Gérer les nouvelles images (si présentes)
    if (payload.images && payload.images.length > 0) {
      const imagesPaths: string[] = []
      for (const imageFile of payload.images) {
        const imageName = `${cuid()}.${imageFile.extname}`
        await imageFile.move(app.publicPath('uploads/articles'), { name: imageName })
        imagesPaths.push(`/uploads/articles/${imageName}`)
      }
      const imagesToStore = imagesPaths.map((path) => ({ imageUrl: path }))
      await article.related('images').createMany(imagesToStore)
    }

    session.flash('success', 'Article mis à jour avec succès')
    return response.redirect().toRoute('article.index')
  }

  async create({ view }: HttpContext) {
    const categories = await Category.all()
    return view.render('pages/dashboard/seller/add_article_1', { categories })
  }

  async show({ params, view, response, bouncer }: HttpContext) {
    // On récupère l'article avec toutes ses données liées
    const article = await Article.query()
      .where('id', params.id)
      .preload('images')
      .preload('category')
      .preload('agrofood')
      .preload('lifestyle')
      .preload('cosmetic')
      .firstOrFail()

    if (await bouncer.with('ArticlePolicy').denies('show', article)) {
      return response.forbidden()
    }
    return view.render('pages/dashboard/seller/show-article', { article })
  }
  async store({ session, response }: HttpContext) {
    const stepOneData = session.get('stepOneData')
    const imagesPaths = session.get('stepOneImages')
    const stepTwoData = session.get('stepTwoData')
    const categoryName = session.get('selectedCategoryName')

    if (!stepOneData) {
      return response.redirect().toRoute('article.create')
    }
    // 2. Créer l'article
    const article = await Article.create(stepOneData)
    if (categoryName === 'Agroalimentaire') {
      await article.related('agrofood').create({
        certification: stepTwoData?.certification,
        ingredient_list: stepTwoData?.ingredient,
        expiry_date: stepTwoData?.expiry_date,
        conservation_advice: stepTwoData?.conservation_advice,
      })
    } else if (categoryName === 'Mode/Artisanat') {
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

  async handleStepOne({ request, session, auth, response }: HttpContext) {
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
      stock: payload.stock,
    })

    session.put('stepOneImages', imagesPaths)
    return response.redirect().toRoute('articles.create.stepTwo')
  }

  async renderStepTwo({ view, session, response }: HttpContext) {
    const categoryName = session.get('selectedCategoryName')

    if (!categoryName) {
      return response.redirect().toRoute('article.create')
    }

    return view.render('pages/dashboard/seller/add_article_2', { category: categoryName })
  }

  async handleStepTwo({ request, response, session }: HttpContext) {
    let payload
    const categoryName = session.get('selectedCategoryName')
    if (categoryName === 'Agroalimentaire') {
      payload = await request.validateUsing(AgrofoodValidator)
    } else if (categoryName === 'Mode/Artisanat') {
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
