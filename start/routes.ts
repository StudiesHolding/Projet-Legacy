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
const OtpValidationsController = () => import('#controllers/otp_validations_controller')
const OauthsController = () => import('#controllers/oauths_controller')
const OrdersController = () => import('#controllers/orders_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const AuthController = () => import('#controllers/auth_controller')
const SellerRegistrationsController = () => import('#controllers/seller_registrations_controller')
const ArticlesController = () => import('#controllers/articles_controller')
const ImagesController = () => import('#controllers/images_controller')
const NavigationsController = () => import('#controllers/navigations_controller')
const CartsController = () => import('#controllers/carts_controller')

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

router.post('login', [AuthController, 'login_client']).as('login_client').use(middleware.guest())
router.get('logout', [AuthController, 'logout_client']).as('logout_client').use(middleware.auth())
router.post('handleStepOne', [SellerRegistrationsController, 'handleStepOne']).as('handleStepOne')
router.post('handleStepTwo', [SellerRegistrationsController, 'finalize']).as('finalize')
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
    router.delete('/cart/:id', [CartsController, 'removeFromCart']).as('api.cart.remove')
    router.delete('/cart', [CartsController, 'clearCart']).as('api.cart.clear')
    router
      .post('/otpVerification', [OtpValidationsController, 'verifyOtp'])
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
    router.post('/login', [AdminController, 'handleLogin']).as('handleLogin')
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
        router.get('/:id', [AdminController, 'showUser']).as('showUser')
        router.get('addSeller', [AdminController, 'showAddSellerPage']).as('addSeller')
        router
          .group(() => {
            router.get('/', [AdminController, 'adminList']).as('home')
            router.get('list', [AdminController, 'adminList']).as('list')
            router.get('admin', [AdminController, 'showAdmin']).as('showAdmin')
            router.get('addAdmin', [AdminController, 'showAddAdminPage']).as('addAdmin')
            router.delete('admin/:id', [AdminController, 'deleteAdmin']).as('deleteAdmin')
          })
          .as('admin')
          .prefix('admin')
      })
      .prefix('users')
      .as('users')
    router
      .group(() => {
        router.get('/', [AdminController, 'showCatalogueOption']).as('home')
        router.get('categories', [AdminController, 'showCategories']).as('categories')
      })
      .prefix('catalog')
      .as('catalog')

    router
      .group(() => {
        router.get('/', [AdminController, 'showDeliveryOption']).as('home')
      })
      .prefix('logistics')
      .as('logistics')

    router.get('finances', [AdminController, 'showFinanceOption']).as('finances')
    router.get('others', [AdminController, 'showOthers']).as('others')
    router.get('/statistics', [AdminController, 'showStatistics']).as('statistics')
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
