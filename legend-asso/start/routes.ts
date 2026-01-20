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
import transmit from '@adonisjs/transmit/services/main'
transmit.registerRoutes()

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

router.get('payement', [NavigationsController, 'payement']).use(middleware.auth()).as('payement')

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
    router.get('/cart/getCart', [CartsController, 'getCart']).as('api.cart.get')
    router.get('/cart/addToCart', [CartsController, 'addToCart']).as('api.cart.add')
    router.delete('/cart/:id', [CartsController, 'removeFromCart']).as('api.cart.remove')
    router.delete('/cart', [CartsController, 'clearCart']).as('api.cart.clear')
  })

  .prefix('/api')

router.resource('order', OrdersController).use('*', middleware.auth())

router
  .group(() => {
    router
      .get('transaction', [TransactionsController, 'initiateTransaction'])
      .as('transaction.initiate')
    router
      .get('transaction/status/:id', [TransactionsController, 'checkStatus'])
      .as('transaction.checkStatus')
  })
  .use(middleware.auth())
