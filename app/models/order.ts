import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import OrderItem from './order_item.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { computed } from '@adonisjs/lucid/orm'
import Adress from './adress.js'
import PhoneNumber from './phone_number.js'

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
  declare phoneNumber: string

  @column()
  declare paymentMethod: string

  @hasOne(() => Adress)
  declare shippingAdress: HasOne<typeof Adress>

  @hasOne(() => PhoneNumber)
  declare PhoneNumber: HasOne<typeof PhoneNumber>

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
