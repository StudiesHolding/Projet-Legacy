import Article from '#models/article'
import Category from '#models/category'
import Seller from '#models/seller'
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
      .orderBy('created_at', 'desc')

    if (categoryName) {
      const searchCategory = await Category.findBy('name', categoryName)
      if (searchCategory) {
        query.where('category_id', searchCategory.id)
      }
    }

    if (searchQuery) {
      query.whereILike('name', `%${searchQuery}%`)
    }

    const articles = await query.paginate(page, 12)

    articles.baseUrl('/')
    const params: any = {}
    if (searchQuery) params.search = searchQuery
    if (categoryName) params.category = categoryName
    articles.queryString(params)

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
      categoryName,
      categories,
    })
  }

  public async showArticleBySlug({ view, params }: HttpContext) {
    const slug = params.slug
    const article = await Article.query()
      .where('slug', slug)
      .preload('images')
      .preload('category')
      .preload('seller', (sellerQuery) => {
        sellerQuery.select('*').preload('user')
      })
      .firstOrFail()
      console.log(article)

    const otherArticles = await Article.query()
      .where('sellerId', article?.sellerId)
      .whereNot('id', article.id)
      .where('available', true)
      .preload('images')
      .limit(10)

    return view.render('pages/catalogue/show_article', {
      article,
      otherArticles,
    })
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
