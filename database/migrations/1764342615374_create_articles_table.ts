import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('about')
      table.integer('price')
      table.integer('category_id')
      table.integer('seller_id')
      table.string('status').defaultTo('pending')
      table.string('slug')
      table.boolean('is_validated').defaultTo(false)
      table.boolean('available')
      table.integer('delivery_time')
      table.string('unit_value')
      table.string('unit_type')
      table.integer('stock')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
