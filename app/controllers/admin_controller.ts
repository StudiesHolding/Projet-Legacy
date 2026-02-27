import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { AdminValidator } from '#validators/admin'
import Article from '#models/article'
import Category from '#models/category'
import Order from '#models/order'
import Transaction from '#models/transaction'
import { DateTime } from 'luxon'
import OrderItem from '#models/order_item'
import { DelivryPriceRuleValidator } from '#validators/delivry_price_rule'
import DelivryPriceRule from '#models/delivry_price_rule'

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

    return view.render('pages/dashboard/admin/home/index', {
      pendingArticles,
      userCount,
      todayTransactionsCount,
    })
  }
  public async login({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/home/login')
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
    const article = await Article.query()
      .where('id', params.id)
      .preload('images')
      .preload('category')
      // .preload('seller')
      .firstOrFail()
    return view.render('pages/dashboard/admin/show-article', { article })
  }

  public async showUserOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/users/index')
  }

  public async showDeliveryOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/logistics/home')
  }

  public async homeCatalogue({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/catalog/home')
  }

  // public async articleList({ view }: HttpContext) {
  //   const articles = await Article.all()
  //   console.log(articles)
  //   return view.render('pages/dashboard/admin/catalog/list', articles)
  // }
  public async articleList({ view }: HttpContext) {
    // 1. On récupère les articles avec leurs relations pour éviter le problème de N+1 queries
    // (On charge l'utilisateur qui a posté et les images)
    const articles = await Article.query()
      .preload('seller')
      .preload('images')
      .orderBy('createdAt', 'desc')
    // .paginate(10)

    // 2. On passe les articles dans un OBJET { articles }
    return view.render('pages/dashboard/admin/catalog/list', {
      articles,
    })
  }

  public async showFinanceOption({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/finances/index')
  }

  public async showStatistics({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/statistics/index')
  }

  public async validate({ params, response }: HttpContext) {
    const article = await Article.findOrFail(params.id)
    article.isValidated = true
    await article.save()
    return response.redirect().back()
  }

  public async reject({ params, response }: HttpContext) {
    const article = await Article.findOrFail(params.id)
    article.status = 'rejected'
    await article.save()
    return response.redirect().back()
  }

  public async showOthers({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/other')
  }
  public async showUser({ view, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return view.render('pages/dashboard/admin/show-user', { user })
  }

  public async showAddSellerPage({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/users/admin/add-seller')
  }

  public async adminList({ view }: HttpContext) {
    const admins = await User.query().where('role', 'admin')
    return view.render('pages/dashboard/admin/users/admin/admin-list', { admins })
  }

  public async showAddAdminPage({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/users/admin/add-admin')
  }

  public async showAdmin({ view, params }: HttpContext) {
    const admin = await User.findOrFail(params.id)
    return view.render('pages/dashboard/admin/show-admin', { admin })
  }

  public async deleteAdmin({ params, response }: HttpContext) {
    const admin = await User.findOrFail(params.id)
    await admin.delete()
    return response.redirect().back()
  }

  public async userList({ view }: HttpContext) {
    const users = await User.query().where('role', '!=', 'admin')
    return view.render('pages/dashboard/admin/users/list', { users })
  }

  public async showCategories({ view }: HttpContext) {
    const categories = await Category.query().preload('articles').orderBy('name')
    return view.render('pages/dashboard/admin/catalog/categories', { categories })
  }

  public async suspendArticle({ view }: HttpContext) {
    ''
  }

  public async deleteArticle({ view }: HttpContext) {
    ''
  }

  public async updateCategory({ view }: HttpContext) {
    ''
  }

  public async deleteCategory({ view }: HttpContext) {
    console.log('***************** deleteCategory *********************')
  }

  public async pendingOrder({ view }: HttpContext) {
    const pendingOrder = await Order.query()
      .where('status', 'pending')
      .preload('order_item')
      .preload('shippingAdress')
      .preload('PhoneNumber')
    return view.render('pages/dashboard/admin/logistics/show-pendingOrder', { pendingOrder })
  }

  public async showOrder({ view, params }: HttpContext) {
    const order = await Order.query()
      .orderBy('createdAt', 'desc')
      .where('id', params.id)
      .preload('shippingAdress')
      .preload('PhoneNumber')
      .preload('order_item')
    return view.render('pages/dashboard/admin/logistics/show-order', { order })
  }

  public async delivry({ view }: HttpContext) {
    const ordersInDelivry = await Order.query()
      .orderBy('createdAt', 'desc')
      .where('status', 'delivry on progress')
      .preload('order_item')
      .preload('shippingAdress')
    return view.render('pages/dashboard/admin/logistics/show-delivry-order', { ordersInDelivry })
  }

  public async delivryCost({ view }: HttpContext) {
    const allRules = await DelivryPriceRule.query().orderBy('minWeight', 'asc')

    // On regroupe les règles par nom de ville
    const groupedRules = allRules.reduce(
      (acc, rule) => {
        const city = rule.city
        if (!acc[city]) {
          acc[city] = []
        }
        acc[city].push(rule)
        return acc
      },
      {} as Record<string, DelivryPriceRule[]>
    )

    return view.render('pages/dashboard/admin/logistics/shipping-rules', {
      groupedRules,
    })
  }

  public async handleDelivryCost({ request, response }: HttpContext) {
    const payload = await request.validateUsing(DelivryPriceRuleValidator)
    await DelivryPriceRule.create({
      city: payload.city,
      maxWeight: Number(payload.maxWeight),
      minWeight: Number(payload.minWeight),
      price: Number(payload.price),
    })
    return response.redirect().back()
  }

  public async history({ view }: HttpContext) {
    console.log('***************** Historique *********************')
  }

  public async performance({ view }: HttpContext) {
    console.log('***************** Performance *********************')
  }
}
