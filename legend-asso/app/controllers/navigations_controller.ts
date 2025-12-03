import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class NavigationsController {
  public async home({ view }: HttpContext) {
    return view.render('pages/home')
  }

  public async catalogue({ view }: HttpContext) {
    const articles = await Article.all()
    console.log(articles)
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
    return view.render('pages/dashboard/admin/index')
  }

  public async showClientDashboard({ view }: HttpContext) {
    return view.render('pages/dashboard/client/index')
  }
}
