import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Admin extends User {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
