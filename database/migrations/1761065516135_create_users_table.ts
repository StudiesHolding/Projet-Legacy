import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable().unique()
      table.string('slug').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('google_id').nullable().unique()
      table.string('avatar_url').nullable().unique()
      table.boolean('is_verify')
      table.string('password').nullable()
      table.enum('role', ['admin', 'seller', 'client']).defaultTo('client')
      table.string('location').nullable()
      table.string('activity_branch').nullable()
      table.string('status').defaultTo('accepted')
      table.string('member_code').nullable()
      table.boolean('is_member').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
