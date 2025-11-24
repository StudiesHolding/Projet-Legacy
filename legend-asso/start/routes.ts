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

router
  .get('/', (ctx) => {
    return ctx.view.render('pages/home')
  })
  .as('home')

router
  .get('catalogue', (ctx) => {
    return ctx.view.render('pages/catalogue/index')
  })
  .as('catalogue')

router
  .get('catalogue/name', (ctx) => {
    return ctx.view.render('pages/catalogue/name')
  })
  .as('show.product')

router
  .get('suppliers', (ctx) => {
    return ctx.view.render('pages/suppliers/index')
  })
  .as('suppliers')

router
  .get('suppliers/name', (ctx) => {
    return ctx.view.render('pages/suppliers/name')
  })
  .as('name')

router
  .get('checkout', (ctx) => {
    return ctx.view.render('pages/checkout')
  })
  .as('checkout')

router
  .get('login', (ctx) => {
    return ctx.view.render('pages/login')
  })
  .as('login').use(middleware.guest())

router
  .get('register-client', (ctx) => {
    return ctx.view.render('pages/register-client')
  })
  .as('register-client').use(middleware.guest())

router
  .get('register-supplier', (ctx) => {
    return ctx.view.render('pages/register-supplier')
  })
  .as('register-supplier')

router.get('dashboard-client',(ctx)=>{
  return ctx.view.render('pages/dashboard/client/index')
}).as('dashboard-client').use(middleware.auth())

router.get('dashboard-seller',(ctx)=>{
  return ctx.view.render('pages/dashboard/seller/index')
}).as('dashboard-seller')

router.get('dashboard-admin',(ctx)=>{
  return ctx.view.render('pages/dashboard/admin/index')
}).as('dashboard-admin')

router.post('register',[AuthController , 'register']).as('client-register')
router.post('login',[AuthController , 'login']).as('client-login')
router.get('logout',[AuthController , 'logout']).as('client-logout')