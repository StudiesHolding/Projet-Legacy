import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 254).notNullable().unique()
      table.string('password').notNullable()
      table.enum('role', ['admin', 'seller', 'client']).defaultTo('client')
      table.boolean('is_verify').notNullable().defaultTo(false)
      table.string('location').nullable()
      table.string('sector').nullable()
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
