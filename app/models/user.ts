import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import Article from './article.js'
import Adress from './adress.js'
import PhoneNumber from './phone_number.js'
import type SellerClass from '#models/seller'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

type RoleType = 'admin' | 'client' | 'seller'

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => Article, {
    localKey: 'id',
    foreignKey: 'id',
  })
  declare user_id: HasOne<typeof Article>

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column()
  declare googleId: string

  @column()
  declare avatarUrl: string

  @column()
  declare isVerify: boolean

  @column({ serializeAs: null })
  declare role: RoleType

  @column({ serializeAs: null })
  declare password: string

  @hasOne(() => import('#models/seller') as any, {
    foreignKey: 'seller_id',
  })
  declare seller: HasOne<typeof SellerClass>

  @hasMany(() => Adress)
  declare adress: HasMany<typeof Adress>

  @hasOne(() => PhoneNumber)
  declare phoneNumber: HasOne<typeof PhoneNumber>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
