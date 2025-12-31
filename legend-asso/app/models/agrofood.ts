import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Agrofood extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

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

  @column()
  declare articleId: number
}
