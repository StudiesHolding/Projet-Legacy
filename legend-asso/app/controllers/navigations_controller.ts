import Article from '#models/article'
import Category from '#models/category'
import type { HttpContext } from '@adonisjs/core/http'

export default class NavigationsController {
  public async home({ view, request }: HttpContext) {
    const searchQuery = request.input('search')
    const page = request.input('page', 1)
    const categories = await Category.query().orderBy('name', 'asc')
    let articles: any

    if (searchQuery) {
      articles = await Article.query()
        .whereILike('name', `%${searchQuery}%`)
        .preload('images')
        .orderBy('created_at', 'desc')
        .paginate(page, 12)
    } else {
      articles = await Article.query()
        .where('available', true)
        .preload('images')
        .orderBy('created_at', 'desc')
        .paginate(page, 12)
    }

    articles.baseUrl('/')
    if (searchQuery) {
      articles.queryString({ search: searchQuery })
    }

    const rangeMin = Math.max(1, articles.currentPage - 1)
    const rangeMax = Math.min(articles.lastPage, articles.currentPage + 1)

    const pagination = articles.getUrlsForRange(1, articles.lastPage).filter((item: any) => {
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
      categories,
    })
  }

  public async showArticleBySlug({ view, params }: HttpContext) {
    const slug = params.slug
    const article = await Article.query()
      .where('slug', slug)
      .preload('category')
      .preload('seller', (sellerQuery) => {
        sellerQuery.select('*').preload('user')
      })
      .preload('images')
      .first()
    return view.render('pages/catalogue/show_article', { article: article })
  }

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
