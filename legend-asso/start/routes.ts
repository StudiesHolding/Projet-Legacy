/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import SellerRegistrationsController from '#controllers/seller_registrations_controller'
import ArticlesController from '#controllers/articles_controller'
import ImagesController from '#controllers/images_controller'
import NavigationsController from '#controllers/navigations_controller'

router.get('/',[NavigationsController,'home']).as('home')
router.get('catalogue',[NavigationsController,'catalogue']).as('catalogue')
router.get('catalogue/:slug',[NavigationsController,'showArticleBySlug']).as('show.product')
router.get('checkout',[NavigationsController,'checkout']).as('checkout')
router.get('login',[NavigationsController,'checkout']).as('login')
router.get('register-client',[NavigationsController,'registerClient']).as('register-client').use(middleware.guest())
router.get('register-supplier',[NavigationsController,'registerSeller']).as('register-supplier').use(middleware.guest())
router.get('register-supplier-2',[NavigationsController,'registerSeller2']).as('register-supplier-2').use(middleware.guest())
router.get('dashboard-seller',[NavigationsController,'showSellerDashboard']).as('dashboard-seller').use(middleware.auth())
router.get('dashboard-client',[NavigationsController,'showClientDashboard']).as('dashboard-client').use(middleware.auth())
// router
//   .get('/', (ctx) => {
//     return ctx.view.render('pages/home')
//   })
//   .as('home')

// router
//   .get('catalogue', (ctx) => {
//     return ctx.view.render('pages/catalogue/index')
//   })
//   .as('catalogue')

// router
//   .get('catalogue/name', (ctx) => {
//     return ctx.view.render('pages/catalogue/name')
//   })
//   .as('show.product')

// router
//   .get('suppliers', (ctx) => {
//     return ctx.view.render('pages/suppliers/index')
//   })
//   .as('suppliers')

// router
//   .get('suppliers/name', (ctx) => {
//     return ctx.view.render('pages/suppliers/name')
//   })
//   .as('name')

// router
//   .get('checkout', (ctx) => {
//     return ctx.view.render('pages/checkout')
//   })
//   .as('checkout')

// router
//   .get('login', (ctx) => {
//     return ctx.view.render('pages/login')
//   })
//   .as('login').use(middleware.guest())

// router
//   .get('register-client', (ctx) => {
//     return ctx.view.render('pages/register-client')
//   })
//   .as('register-client').use(middleware.guest())

// router
//   .get('register-supplier', (ctx) => {
//     return ctx.view.render('pages/register-supplier')
//   })
//   .as('register-supplier')

// router
//   .get('register-supplier-2', (ctx) => {
//     return ctx.view.render('pages/register-supplier-2')
//   })
//   .as('register-supplier-2')

// router.get('dashboard-client',(ctx)=>{
//   return ctx.view.render('pages/dashboard/client/index')
// }).as('dashboard-client').use(middleware.auth())

// router.get('dashboard-seller',(ctx)=>{
//   return ctx.view.render('pages/dashboard/seller/index')
// }).as('dashboard-seller')

// router.get('dashboard-admin',(ctx)=>{
//   return ctx.view.render('pages/dashboard/admin/index')
// }).as('dashboard-admin')

router.post('register',[AuthController , 'register_client']).as('register_client')
router.post('login',[AuthController , 'login_client']).as('login_client')
router.get('logout',[AuthController , 'logout_client']).as('logout_client')
router.post('handleStepOne',[SellerRegistrationsController , 'handleStepOne']).as('handleStepOne')
router.post('handleStepTwo',[SellerRegistrationsController , 'finalize']).as('finalize')

router.resource('article', ArticlesController).use(middleware.auth())
router.delete('images/:imageId', [ImagesController, 'destroy']).as('image.destroy')