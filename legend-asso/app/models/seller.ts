import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Article from './article.js'
import user from '#models/user'

export default class Seller extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @hasOne(() => User, {
    localKey: 'id',
    foreignKey: 'id',
  })
  declare user: HasOne<typeof user>

  @column()
  declare sector: string

  @column()
  declare location: string

  @column()
  declare is_member: boolean

  @column({ columnName: 'member_code' })
  declare memberCode: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Article, {
    localKey: 'id',
    foreignKey: 'seller_id',
  })
  declare articles: HasMany<typeof Article>
}
