import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import OrderItem from '#models/order_item'

export default class OrderPolicy extends BasePolicy {
  update(user: User, order_item: OrderItem): AuthorizerResponse {
    return user.id === order_item.sellerId
  }

  delete(user: User, order_item: OrderItem): AuthorizerResponse {
    return user.id === order_item.sellerId
  }

  show(user: User, order_item: OrderItem): AuthorizerResponse {
    return user.id === order_item.sellerId
  }
}
