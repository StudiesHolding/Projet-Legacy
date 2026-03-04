import type { WebSocketContext } from 'adonisjs-websocket'
import { CartService } from '#services/cart_service'

export default class WsController {
  public async getDeliveryFee(cart: any) {
    let cartWeight = 0
    cart.items.map((item: any) => {
      cartWeight += Number(item.weight)
    })
  }
}
