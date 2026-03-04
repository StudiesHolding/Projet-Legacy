import { CartService } from '#services/cart_service'
import { HttpContext } from '@adonisjs/core/http'

export default class CartsController {
  async addToCart(ctx: HttpContext) {
    return await CartService.add(ctx)
  }

  async getCart(ctx: HttpContext) {
    return await CartService.get(ctx)
  }

  async removeToCart(ctx: HttpContext) {
    return await CartService.remove(ctx)
  }

  async clearCart(ctx: HttpContext) {
    return await CartService.clear(ctx)
  }

  async getDelivery(ctx: HttpContext) {
    const fee = await CartService.addDeliveryFeeToCart(ctx)
    const total = await CartService.totalAmount(ctx)
    return { fee, total }
  }
}
