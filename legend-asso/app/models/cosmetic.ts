import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Article from '#models/article'

export default class Cosmetic extends BaseModel {
  protected tableName = 'cosmetics'

  @column({ isPrimary: true })
  declare id: number

  @column({
    // Transforme le tableau en chaîne JSON pour la base de données
    prepare: (value: string[]) => (value ? JSON.stringify(value) : null),

    // Transforme la chaîne JSON de la base de données en tableau pour ton code
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch {
        return []
      }
    },
  })
  declare ingredients: string[]

  @column()
  declare articleId: number

  @column()
  declare precautions: string

  @column()
  declare capacity_value: number

  @column()
  declare capacity_unit: 'ml' | 'l' | 'g' | 'kg'

  @column()
  declare skinType: string

  @column()
  declare texture: string

  @belongsTo(() => Article)
  declare article: BelongsTo<typeof Article>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
