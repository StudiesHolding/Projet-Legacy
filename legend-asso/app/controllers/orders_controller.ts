import OrderItem from '#models/order_item'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrdersController {
  async showOrderInfo({ params, view }: HttpContext) {
    const id = params.id
    const orderItem = await OrderItem.query().where('id', id)
    return view.render('pages/dashboard/seller/process', { orderItem })
  }

  async update({ response, request, session }: HttpContext) {
    console.log(request.all())
    console.log('saratoga...............................')
    const orderItem = await OrderItem.findOrFail(id)
    orderItem.status = 'complete'
    await orderItem.save()
    session.flash('success', 'La commande a été marquée comme complétée.')

    return response.redirect().toRoute('dashboard-seller')
  }
}
