import { column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Article from './article.js'

export default class Seller extends User {
  public static table = 'users'
  @column()
  declare sector: string

  @column()
  declare location: string

  @column()
  declare is_member: boolean

  @column({ columnName: 'member_code' })
  declare memberCode: string | null

  @hasMany(() => Article, {
    localKey: 'id',
    foreignKey: 'seller_id',
  })
  declare articles: HasMany<typeof Article>
}
