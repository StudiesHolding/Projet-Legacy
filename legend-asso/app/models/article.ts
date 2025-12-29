import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Image from '#models/image'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Seller from './seller.js'
import Category from './category.js'

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare available: boolean

  @column()
  declare about: string

  @column()
  declare price: number

  @column({ columnName: 'category_id' })
  declare categoryId: number

  @column()
  declare measure: number

  @column()
  declare delivery_time: number

  @column({ columnName: 'seller_id' })
  declare sellerId: number

  @column()
  declare status: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Image, {
    foreignKey: 'articleId',
  })
  declare images: HasMany<typeof Image>

  @belongsTo(() => Category, {
    foreignKey: 'categoryId',
  })
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => Seller, {
    localKey: 'id',
    foreignKey: 'sellerId',
  })
  declare seller: BelongsTo<typeof Seller>
}
