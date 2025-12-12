import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Image from '#models/image'
import { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Seller from './seller.js'

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

  @hasMany(() => Image)
  public images: HasMany<typeof Image> | undefined

  @belongsTo(() => Seller, {
    localKey: 'id',
    foreignKey: 'seller_id',
  })
  public seller: BelongsTo<typeof Seller> | undefined
}
