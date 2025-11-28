import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Image  from '#models/image'

export default class Article extends BaseModel {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare about: string

  @column()
  declare price: number

  @column()
  declare category: string

  @column()
  declare measure: number

  @column()
  declare seller_id: number

  @column()
  declare status: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(()=>Image)
  public images: HasMany<typeof Image>
}