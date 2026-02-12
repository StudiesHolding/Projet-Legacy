import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Order from './order.js'

export default class PhoneNumber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare phoneNumber: string

  @column()
  declare orderId: number

  @hasMany(() => User)
  declare user: HasMany<typeof User>

  @hasOne(() => Order)
  declare order: HasOne<typeof Order>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
