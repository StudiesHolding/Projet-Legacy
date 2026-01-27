import Article from '#models/article'
import Category from '#models/category'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NavigationsController {
  public async home({ view, request }: HttpContext) {
    const searchQuery = request.input('search')
    const categoryName = request.input('category')
    const priceMin = request.input('price_min')
    const priceMax = request.input('price_max')
    const availability = request.input('availability', 'available') // default to available
    const page = request.input('page', 1)
    const categories = await Category.query().orderBy('name', 'asc')

    const query = Article.query().preload('images').orderBy('createdAt', 'desc')

    // Filter by availability
    if (availability === 'available') {
      query.where('available', true)
    } else if (availability === 'unavailable') {
      query.where('available', false)
    }
    // If 'all', no filter

    if (categoryName) {
      query.whereHas('category', (catQuery) => {
        catQuery.where('name', categoryName)
      })
    }

    if (searchQuery) {
      query.whereILike('name', `%${searchQuery}%`)
    }

    if (priceMin) {
      query.where('price', '>=', Number.parseFloat(priceMin))
    }

    if (priceMax) {
      query.where('price', '<=', Number.parseFloat(priceMax))
    }

    const articles = await query.paginate(page, 12)
    articles.baseUrl('/')

    const params = {
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(categoryName ? { category: categoryName } : {}),
      ...(priceMin ? { price_min: priceMin } : {}),
      ...(priceMax ? { price_max: priceMax } : {}),
      ...(availability !== 'available' ? { availability } : {}),
    }
    articles.queryString(params)

    const queryString = new URLSearchParams(params).toString()

    const rangeMin = Math.max(1, articles.currentPage - 1)
    const rangeMax = Math.min(articles.lastPage, articles.currentPage + 1)

    const pagination = articles.getUrlsForRange(1, articles.lastPage).filter((item) => {
      return (
        item.page === 1 ||
        item.page === articles.lastPage ||
        (item.page >= rangeMin && item.page <= rangeMax)
      )
    })

    return view.render('pages/catalogue/index', {
      articles,
      pagination,
      searchQuery,
      categoryName,
      categories,
      priceMin,
      priceMax,
      availability,
      queryString,
    })
  }

  public async showArticleBySlug({ view, params }: HttpContext) {
    const slug = params.slug

    // 1. Récupération de l'article de base
    const article = await Article.query()
      .where('slug', slug)
      .preload('images')
      .preload('agrofood')
      .preload('category')
      .preload('seller')
      .preload('lifestyle')
      .preload('cosmetic')
      .firstOrFail()

    // 3. Articles suggérés
    const otherArticles = await Article.query()
      .where('sellerId', article.sellerId)
      .whereNot('id', article.id)
      .preload('images')
      .limit(10)

    return view.render('pages/catalogue/show_article', {
      article,
      otherArticles,
    })
  }

  // --- Autres méthodes ---
  public async checkout({ view, session }: HttpContext) {
    const cart = session.get('cart') || { items: [] }
    return view.render('pages/checkout', { cart })
  }

  public async login({ view }: HttpContext) {
    return view.render('pages/login')
  }

  public async payement({ response }: HttpContext) {
    return response.redirect().toRoute('order.store')
  }

  public async registerClient({ view }: HttpContext) {
    return view.render('pages/register-client')
  }

  public async registerSeller({ view }: HttpContext) {
    return view.render('pages/register-supplier')
  }

  public async registerSeller2({ view }: HttpContext) {
    return view.render('pages/register-supplier-2')
  }
  public async showMyOrder({ auth, view }: HttpContext) {
    const user = await auth.authenticate()
    const myOrders = await Order.query().where('buyer_id', user.id).orderBy('id', 'desc')
    return view.render('pages/dashboard/client/orders', { myOrders })
  }

  public async showSellerDashboard({ auth, view }: HttpContext) {
    const user = await auth.authenticate()
    const myOrders = await OrderItem.query().where('seller_id', user.id).orderBy('id', 'desc')

    let totalRevenue = 0
    for (const order of myOrders) {
      totalRevenue += Number(order.priceAtPurchase) * Number(order.quantity)
    }
    return view.render('pages/dashboard/seller/index', { myOrders, totalRevenue })
  }

  public async showClientDashboard({ auth, view }: HttpContext) {
    const user = await auth.authenticate()
    const myOrders = await Order.query().where('buyer_id', user?.id).orderBy('id', 'desc')
    let totalSpend = 0
    for (const order of myOrders) {
      totalSpend += Number(order.totalPrice)
    }

    return view.render('pages/dashboard/client/index', {
      myOrders: myOrders,
      totalSpend: totalSpend,
    })
  }
}
