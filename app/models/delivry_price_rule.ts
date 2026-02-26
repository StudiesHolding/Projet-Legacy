import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class DelivryPriceRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare city: string

  @column()
  declare minWeight: number

  @column()
  declare maxWeight: number

  @column()
  declare price: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
