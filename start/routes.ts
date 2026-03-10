/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AdminController = () => import('#controllers/admin_controller')
const OauthsController = () => import('#controllers/oauths_controller')
const OrdersController = () => import('#controllers/orders_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const AuthController = () => import('#controllers/auth_controller')
const ArticlesController = () => import('#controllers/articles_controller')
const ImagesController = () => import('#controllers/images_controller')
const NavigationsController = () => import('#controllers/navigations_controller')
const CartsController = () => import('#controllers/carts_controller')
// const WsController = () => import('#controllers/ws_controller')

router.get('/', [NavigationsController, 'home']).as('home')
router.get('catalogue/:slug', [NavigationsController, 'showArticleBySlug']).as('show.product')
router.get('checkout', [NavigationsController, 'checkout']).as('checkout')
router.get('login', [NavigationsController, 'login']).as('login')
router
  .get('register-client', [NavigationsController, 'registerClient'])
  .as('register-client')
  .use(middleware.guest())
router
  .get('register-supplier', [NavigationsController, 'registerSeller'])
  .as('register-supplier')
  .use(middleware.guest())
router
  .get('register-supplier-2', [NavigationsController, 'registerSeller2'])
  .as('register-supplier-2')
  .use(middleware.guest())
router
  .get('dashboard-seller', [NavigationsController, 'showSellerDashboard'])
  .as('dashboard-seller')
  .use(middleware.auth())
router
  .get('dashboard-client', [NavigationsController, 'showClientDashboard'])
  .use(middleware.auth())
  .as('dashboard-client')

router
  .get('dashboard-client/my-order', [NavigationsController, 'showMyOrder'])
  .use(middleware.auth())
  .as('showMyOrder')

router.get('payement', [NavigationsController, 'payement']).use(middleware.auth()).as('payement')
router
  .get('otp-verification', [NavigationsController, 'showOtpPage'])
  .use(middleware.guest())
  .as('otp-page')

router
  .post('register', [AuthController, 'register_client'])
  .as('register_client')
  .use(middleware.guest())

router
  .group(() => {
    router.post('login', [AuthController, 'loginClient']).as('loginClient').use(middleware.guest())
    router.get('logout', [AuthController, 'logout']).as('logout').use(middleware.auth())
    router.post('handleStepOne', [AuthController, 'registerSeller']).as('registerSeller')
    router.post('handleStepTwo', [AuthController, 'finalize']).as('finalize')
  })
  .use(middleware.guest())

router
  .group(() => {
    router
      .post('article/handleStepOne', [ArticlesController, 'handleStepOne'])
      .as('handleStepOneForArticle')
    router
      .get('article/create/step-two', [ArticlesController, 'renderStepTwo'])
      .as('articles.create.stepTwo')
    router
      .post('article/handleStepTwo', [ArticlesController, 'handleStepTwo'])
      .as('handleStepTwoForArticle')

    router
      .resource('article', ArticlesController)
      .params({ article: 'id' })
      .where('id', /^[0-9]+$/)
    router.delete('images/:imageId', [ImagesController, 'destroy']).as('image.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('redirect', [OauthsController, 'redirect']).as('redirect')
    router.get('callback', [OauthsController, 'callback']).as('callback')
  })
  .prefix('google')

router
  .group(() => {
    router.get('/cart/getCart', [CartsController, 'getCart']).as('api.cart.get')
    router.get('/cart/addToCart', [CartsController, 'addToCart']).as('api.cart.add')
    router.delete('/cart/:id', [CartsController, 'removeToCart']).as('api.cart.remove')
    router.delete('/cart', [CartsController, 'clearCart']).as('api.cart.clear')
    router
      .post('/otpVerification', [AuthController, 'handleOtpVerification'])
      .as('verify-otp')
      .use(middleware.guest())
  })
  .prefix('/api')

router
  .group(() => {
    router.get('my-order/:id', [OrdersController, 'showOrderInfo']).as('order.showOrderInfo')
    router.post('process/:id', [OrdersController, 'update']).as('order.update')
    router.get('show-order/:id', [OrdersController, 'show']).as('order.show')
  })
  .prefix('/dashboard/')
  .use(middleware.auth())

router
  .group(() => {
    router
      .post('transaction', [TransactionsController, 'initiateTransaction'])
      .as('transaction.initiate')
    router
      .get('transaction/status', [TransactionsController, 'checkStatus'])
      .as('transaction.checkStatus')
  })
  .prefix('/api')
  .use(middleware.auth())

router
  .group(() => {
    router.get('/sales', [NavigationsController, 'salesPage']).as('sales')
    router.get('/adress', [NavigationsController, 'myAdressPage']).as('myAdress')
    router.get('/withdrawal', [NavigationsController, 'withdrawalPage']).as('withdrawal')
    router.get('/profile', [NavigationsController, 'profilePage']).as('profile')
  })
  .prefix('/dashboard')
  .use(middleware.auth())

router
  .group(() => {
    router.get('/login', [AdminController, 'login']).as('login')
    router.get('register/:email', [AdminController, 'registerAdmin']).as('register')
    router.post('/login', [AdminController, 'handleLogin']).as('handleLogin')
    router.post('register', [AdminController, 'storeAdmin']).as('registerAdmin')
  })
  .prefix('/admin-space')
  .as('admin')
  .use(middleware.guest())

router
  .group(() => {
    router.get('/logout', [AdminController, 'handleLogout']).as('logout')
    router.get('/', [AdminController, 'home']).as('home')
    router
      .group(() => {
        router.get('/', [AdminController, 'showUserOption']).as('home')
        router.get('list', [AdminController, 'userList']).as('list')
        router.get('addAdmin', [AdminController, 'addAdmin']).as('addAdmin')
        router.post('addSeller', [AdminController, 'showAddSellerPage']).as('addSeller')
        router.get('/:id', [AdminController, 'showUser']).as('showUser')
        router.delete(':id', [AdminController, 'removeClient']).as('removeClient')
        router.patch(':id', [AdminController, 'setUserStatus']).as('setUserStatus')
        router
          .group(() => {
            router.get('/', [AdminController, 'adminList']).as('home')
            router.get('list', [AdminController, 'adminList']).as('list')
            router.get('admin', [AdminController, 'showAdmin']).as('showAdmin')
            router.get('show-admin', [AdminController, 'addAdminForm']).as('addAdminForm')
            router.post('addAdmin', [AdminController, 'addAdmin']).as('addAdmin')
            router.delete('admin/:id', [AdminController, 'deleteAdmin']).as('deleteAdmin')
          })
          .as('admin')
          .prefix('admin')
      })
      .prefix('users')
      .as('users')
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [AdminController, 'homeCatalogue']).as('home')
            router.get('list', [AdminController, 'articleList']).as('list')
            router.delete('/:id', [AdminController, 'deleteArticle']).as('delete')
            router.patch('/:id', [AdminController, 'suspendArticle']).as('suspend')
            router.get('/:id', [AdminController, 'showArticle']).as('show')
          })
          .as('article')
          .prefix('article')

        router
          .group(() => {
            router.get('/', [AdminController, 'showCategories']).as('home')
            router.patch('/:id', [AdminController, 'updateCategory']).as('update')
            router.delete('/:id', [AdminController, 'deleteCategory']).as('delete')
          })
          .as('categories')
          .prefix('categories')
      })
      .prefix('catalog')
      .as('catalog')

    router
      .group(() => {
        router.get('/', [AdminController, 'showDeliveryOption']).as('home')
        router.get('pendingOrder', [AdminController, 'pendingOrder']).as('pendingOrder')
        router.get('delivry', [AdminController, 'delivry']).as('delivry')
        router.get('history', [AdminController, 'history']).as('history')
        router.get('performance', [AdminController, 'performance']).as('performance')
        router.get('delivry-cost', [AdminController, 'delivryCost']).as('delivryCost')
        router.post('delivry-cost', [AdminController, 'handleDelivryCost']).as('handleDelivryCost')
        router.get('show-order/:id', [AdminController, 'showOrder']).as('show-order')
      })
      .prefix('logistics')
      .as('logistics')

    router
      .group(() => {
        router.get('/', [AdminController, 'showFinanceOption']).as('index')
        router.get('transaction', [AdminController, 'transaction']).as('transaction')
        router.get('refund', [AdminController, 'refund']).as('refund')
        router.get('charge-back', [AdminController, 'chargeBack']).as('charge-back')
        router.get('analytics', [AdminController, 'analytics']).as('analytics')
      })
      .prefix('finances')
      .as('finances')

    router.get('others', [AdminController, 'showOthers']).as('others')

    router
      .group(() => {
        router.get('/', [AdminController, 'showStatistics']).as('index')
      })
      .prefix('statistics')
      .as('statistics')

    router.get('/article/:id', [AdminController, 'showArticle']).as('article')

    router
      .group(() => {
        router.get('/article/:id/validate', [AdminController, 'validate']).as('validate')
        router.get('/article/:id/reject', [AdminController, 'reject']).as('reject')
      })
      .as('article')
  })
  .use(middleware.auth())
  .prefix('/admin-space')
  .as('admin')
