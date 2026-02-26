import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Article from './article.js'
import User from './user.js'

export default class Seller extends User {
  public static table = 'users'
  @column()
  declare activityBranch: string

  @column()
  declare location: string

  @column()
  declare isMember: boolean

  @column()
  declare memberCode: string | null

  @hasMany(() => Article)
  declare articles: HasMany<typeof Article>
}
