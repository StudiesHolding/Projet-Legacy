import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class Transaction extends BaseModel {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare buyerId: number

  @column()
  declare status: string

  @column()
  declare note: string

  @column()
  declare totalPrice: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(transaction: Transaction) {
    transaction.id = uuidv4()
  }
}
