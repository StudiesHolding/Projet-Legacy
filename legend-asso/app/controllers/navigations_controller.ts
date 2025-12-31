import Article from '#models/article'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class NavigationsController {
  public async home({ view, request }: HttpContext) {
    const searchQuery = request.input('search')
    const categoryName = request.input('category')
    const page = request.input('page', 1)
    const categories = await Category.query().orderBy('name', 'asc')

    const query = Article.query()
      .where('available', true)
      .preload('images')
      .orderBy('createdAt', 'desc') // Attention : en Lucid c'est souvent camelCase

    if (categoryName) {
      // On utilise une jointure ou une sous-requête pour être plus efficace
      query.whereHas('category', (catQuery) => {
        catQuery.where('name', categoryName)
      })
    }

    if (searchQuery) {
      query.whereILike('name', `%${searchQuery}%`)
    }

    const articles = await query.paginate(page, 12)
    articles.baseUrl('/')

    // Gestion de la pagination pour la vue
    const params = {
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(categoryName ? { category: categoryName } : {}),
    }
    articles.queryString(params)

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
      .firstOrFail()

    // // 2. Chargement "Lazy" du polymorphisme (Delegated Types)
    // // On vérifie le nom ou le slug de la catégorie
    // if (article.category.name === 'agroalimentaire') {
    // } else if (article.category.name === 'electronique') {
    //   // await article.load('electronic')
    // }

    // 3. Articles suggérés
    const otherArticles = await Article.query()
      .where('sellerId', article.sellerId)
      .whereNot('id', article.id)
      .where('available', true)
      .preload('images')
      .preload('category')
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

  public async payement({ view }: HttpContext) {
    return view.render('pages/login')
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

  public async showSellerDashboard({ view }: HttpContext) {
    return view.render('pages/dashboard/seller/index')
  }

  public async showClientDashboard({ view }: HttpContext) {
    return view.render('pages/dashboard/client/index')
  }
}
