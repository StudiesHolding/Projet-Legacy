/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

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
