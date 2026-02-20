import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { AdminValidator } from '#validators/admin'
import Article from '#models/article'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'

export default class AdminController {
  startOfToday = DateTime.now().startOf('day').toSQL()

  public async home({ view }: HttpContext) {
    const pendingArticles = await Article.query().where('status', 'pending')
    const userCount = await User.query()
      .where('role', 'client')
      .count('* as total')
      .then((res) => Number(res[0].$extras.total))

    const todayTransactionsCount = await Transaction.query()
      .where('created_at', '>=', this.startOfToday)
      .where('status', 'accepted')
      .count('* as total')
      .then((res) => Number(res[0].$extras.total))

    return view.render('pages/dashboard/admin/index', {
      pendingArticles,
      userCount,
      todayTransactionsCount,
    })
  }
  public async login({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/login')
  }

  public async handleLogin({ response, request, auth }: HttpContext) {
    const data = await request.validateUsing(AdminValidator)
    const user = await User.verifyCredentials(data.email, data.password)
    await auth.use('web').login(user)
    return response.redirect().toRoute('admin.home')
  }

  public async handleLogout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('admin.login')
  }

  public async showArticle({ view, params }: HttpContext) {
    console.log(params.id)
    const article = await Article.query()
      .where('id', params.id)
      .preload('images')
      .preload('category')
      // .preload('seller')
      .firstOrFail()
    return view.render('pages/dashboard/admin/show-article', { article })
  }

  public async showUserOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/users')
  }

  public async showDeliveryOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/logistics')
  }

  public async showCatalogueOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/catalog')
  }

  public async showFinanceOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/finances')
  }

  public async showStatistics({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/statistics')
  }

  public async validateArticle({ params, response }: HttpContext) {
    const article = await Article.findOrFail(params.id)
    article.isValidated = true
    await article.save()
    return response.redirect().back()
  }

  public async rejectArticle({ params, response }: HttpContext) {
    const article = await Article.findOrFail(params.id)
    article.status = 'rejected'
    await article.save()
    return response.redirect().back()
  }

  public async showOthers({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/other')
  }
}
