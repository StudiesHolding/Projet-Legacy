import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class NavigationsController {
  public async home({ view }: HttpContext) {
    return view.render('pages/home')
  }

<<<<<<< HEAD
  public async catalogue({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const articles = await Article.query().orderBy('created_at', 'desc').paginate(page, 12)
    articles.baseUrl('/catalogue')
=======
  public async catalogue({ view }: HttpContext) {
    const articles = await Article.all()
>>>>>>> e15151918d96fdc9505a1e2062728863df42b4da
    return view.render('pages/catalogue/index', { articles: articles })
  }

  public async showArticleBySlug({ view, params }: HttpContext) {
    const slug = params.slug
    const article = await Article.query().where('slug', slug).first()
    return view.render('pages/catalogue/show_article', { article: article })
  }

  public async checkout({ view }: HttpContext) {
    return view.render('pages/checkout')
  }

  public async login({ view }: HttpContext) {
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
