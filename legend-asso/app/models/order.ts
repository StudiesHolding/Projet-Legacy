import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import OrderItem from './order_item.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { computed } from '@adonisjs/lucid/orm'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare buyerId: number

  @column()
  declare status: string

  @column()
  declare totalPrice: number

  @column()
  declare transactionId: string

  @computed()
  public get isFullyReady() {
    if (!this.order_item) return false
    return (
      this.order_item.length > 0 &&
      this.order_item.every((item) => (item.status = 'ready-for-delivery'))
    )
  }

  @hasMany(() => OrderItem)
  declare order_item: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
