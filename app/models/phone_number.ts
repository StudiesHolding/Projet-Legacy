import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Order from './order.js'
import type User from './user.js'

export default class PhoneNumber extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare phoneNumber: string

  @column()
  declare orderId: number

  @hasMany(() => import('./user.js') as any)
  declare user: HasMany<typeof User>

  @hasOne(() => Order)
  declare order: HasOne<typeof Order>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
