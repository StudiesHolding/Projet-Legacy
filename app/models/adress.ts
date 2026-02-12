import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import Order from './order.js'
import User from './user.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'

export default class Adress extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare adress: string

  @column()
  declare orderId: number

  @hasOne(() => Order)
  declare order: HasOne<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
