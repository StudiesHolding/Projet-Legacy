import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Article from '#models/article'

export default class Lifestyle extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare articleId: number

  @column({
    prepare: (value: string[]) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value // Déjà un tableau
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        return typeof value === 'string' ? value.split(',') : []
      }
    },
  })
  declare materials: string[]

  @column({
    prepare: (value: string[]) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        return typeof value === 'string' ? value.split(',') : []
      }
    },
  })
  declare variants: string[]

  @column({
    prepare: (value: string[]) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        return typeof value === 'string' ? value.split(',') : []
      }
    },
  })
  declare craftsmanship: string[]

  @column({
    prepare: (value: string[]) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch (e) {
        return typeof value === 'string' ? value.split(',') : []
      }
    },
  })
  declare sizes: string[]

  @column()
  declare length: number | null

  @column()
  declare width: number | null

  @column()
  declare height: number | null

  @column()
  declare weight: number | null

  @column()
  declare style: string | null

  @column()
  declare usage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>
}
