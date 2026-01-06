import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cosmetic extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare articleId: string

  @column()
  declare precautions: string

  @column()
  declare targetSkin: string

  @column()
  declare productForm: string

  @column()
  declare ingredients: string[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
