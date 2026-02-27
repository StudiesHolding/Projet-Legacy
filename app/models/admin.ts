import { DateTime } from 'luxon'
import { column } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Admin extends User {
  public static table = 'users'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
