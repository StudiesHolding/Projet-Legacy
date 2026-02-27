import type { WebSocketContext } from 'adonisjs-websocket'
import { CartService } from '#services/cart_service'

export default class WsController {
  public async getDeliveryFee(cart: any) {
    let cartWeight = 0
    cart.items.map((item: any) => {
      cartWeight += Number(item.weight)
    })
  }
  public async calculateDeliveryFee({ request, ws, session }: WebSocketContext) {
    const { weigth, city } = request.only(['city', 'weigth'])
    const deliveryCost = CartService.getDeliveryCost(city, weigth)
    const deliveryFee = JSON.stringify({ event: 'delivery_fee', price: deliveryCost })
    ws.send(deliveryFee)
  }
}
