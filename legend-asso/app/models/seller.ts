import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Seller extends BaseModel {

  @column({ isPrimary: true })
  declare id: number 
  
  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'id',
  })

  declare user: BelongsTo<typeof User>

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
}