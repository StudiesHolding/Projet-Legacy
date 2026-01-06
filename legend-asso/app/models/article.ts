import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Image from '#models/image'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Seller from './seller.js'
import Category from './category.js'
import Agrofood from './agrofood.js'
import Lifestyle from './lifestyle.js'

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

  @column()
  declare unit_value: string

  @column()
  declare unit_type: string

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

  @hasOne(() => Agrofood, {
    foreignKey: 'articleId',
  })
  declare agrofood: HasOne<typeof Agrofood>

  @hasOne(() => Lifestyle, {
    foreignKey: 'articleId',
  })
  declare lifestyle: HasOne<typeof Lifestyle>

  public get details() {
    return this.agrofood || this.lifestyle
  }

  @hasMany(() => Image, {
    foreignKey: 'articleId',
  })
  declare images: HasMany<typeof Image>

  @belongsTo(() => Category, {
    foreignKey: 'categoryId',
  })
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => Seller, {
    foreignKey: 'sellerId',
  })
  declare seller: BelongsTo<typeof Seller>
}
