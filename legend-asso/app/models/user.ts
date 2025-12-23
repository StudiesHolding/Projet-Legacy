import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Seller from '#models/seller'
import type { HasOne } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

type RoleType = 'admin' | 'client' | 'seller'

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column()
  declare phone: string

  @column({ serializeAs: null })
  declare role: RoleType

  @column({ serializeAs: null })
  declare password: string

  @hasOne(() => Seller, {
    foreignKey: 'seller_id',
  })
  declare seller: HasOne<typeof Seller>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
