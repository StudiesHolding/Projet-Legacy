import { DateTime } from 'luxon'
import { column } from '@adonisjs/lucid/orm'
import Article from './article.js'

export default class AgrofoodSecondaryInfo extends Article {
  public static table = 'articles'
  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare certification: string[]

  @column()
  declare conservation_advice: string

  @column()
  declare expiry_date: DateTime

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare ingredient_list: string[]
}
