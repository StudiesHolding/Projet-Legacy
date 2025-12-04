/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const SellerRegistrationsController = () => import('#controllers/seller_registrations_controller')
const ArticlesController = () => import('#controllers/articles_controller')
const ImagesController = () => import('#controllers/images_controller')
const NavigationsController = () => import('#controllers/navigations_controller')
const CartsController = () => import('#controllers/carts_controller')

router.get('/', [NavigationsController, 'home']).as('home')
router.get('catalogue', [NavigationsController, 'catalogue']).as('catalogue')
router.get('catalogue/:slug', [NavigationsController, 'showArticleBySlug']).as('show.product')
router.get('checkout', [NavigationsController, 'checkout']).as('checkout')
router.get('login', [NavigationsController, 'checkout']).as('login')
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
  .as('dashboard-client')
  .use(middleware.auth())
router.get('cart', [CartsController, 'addToCart']).as('cart').prefix('/api')
router.post('register', [AuthController, 'register_client']).as('register_client')
router.post('login', [AuthController, 'login_client']).as('login_client')
router.get('logout', [AuthController, 'logout_client']).as('logout_client')
router.post('handleStepOne', [SellerRegistrationsController, 'handleStepOne']).as('handleStepOne')
router.post('handleStepTwo', [SellerRegistrationsController, 'finalize']).as('finalize')

router.resource('article', ArticlesController).use(middleware.auth())
router.delete('images/:imageId', [ImagesController, 'destroy']).as('image.destroy')