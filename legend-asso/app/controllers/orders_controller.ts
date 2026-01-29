import OrderItem from '#models/order_item'
import Order from '#models/order'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrdersController {
  async showOrderInfo({ params, view }: HttpContext) {
    const id = params.id
    const orderItem = await OrderItem.query().where('order_id', id)
    return view.render('pages/dashboard/seller/process', { id, orderItem })
  }

  async update({ response, auth, session, params }: HttpContext) {
    const user = await auth.authenticate()
    const orderItems = await OrderItem.query()
      .where('order_id', params.id)
      .where('seller_id', user.id)

    for (const item of orderItems) {
      item.status = 'complete'
      await item.save()
    }
    session.flash('success', 'La commande a été marquée comme complétée.')
    return response.redirect().toRoute('dashboard-seller')
  }

  async show({ view, params }: HttpContext) {
    console.log(params.id)
    const order = await Order.query()
      .where('id', params.id)
      .preload('order_item')
      .orderBy('id', 'desc')
    return view.render('pages/dashboard/client/show-order', { order })
  }
}
