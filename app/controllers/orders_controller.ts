import OrderItem from '#models/order_item'
import Order from '#models/order'
import type { HttpContext } from '@adonisjs/core/http'
import OrderPolicy from '#policies/order_policy'
import Adress from '#models/adress'

export default class OrdersController {
  async showOrderInfo({ bouncer, params, view, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const id = params.id
    const orderItem = await OrderItem.query().where('order_id', id).where('seller_id', user?.id)

    if (orderItem.length === 0) {
      return response.notFound("Cette commande ne vous appartient pas ou n'existe pas.")
    }

    if (await bouncer.with(OrderPolicy).denies('show', orderItem[0])) {
      return response.forbidden('Accès refusé.')
    }

    const canReady = orderItem.every((item) => item.status === 'pending')

    return view.render('pages/dashboard/seller/process', {
      id,
      orderItem,
      canReady,
    })
  }

  async update({ response, auth, session, params }: HttpContext) {
    const user = await auth.authenticate()
    const orderItems = await OrderItem.query()
      .where('order_id', Number(params.id))
      .where('seller_id', Number(user.id))

    for (const item of orderItems) {
      item.status = 'ready-for-delivery'
      await item.save()
    }
    session.flash('success', 'La commande a été marquée comme complétée.')
    return response.redirect().toRoute('dashboard-seller')
  }

  async show({ view, params }: HttpContext) {
    const order = await Order.query()
      .where('id', params.id)
      .preload('order_item')
      .preload('shippingAdress')
      .orderBy('id', 'desc')

    return view.render('pages/dashboard/client/show-order', { order })
  }
}
