import { DateTime } from 'luxon'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Adress from './adress.js'
import User from './user.js'

export default class Client extends User {
  public static table = 'users'

  @column()
  declare googleId: string

  @hasMany(() => Adress)
  declare adress: HasMany<typeof Adress>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
