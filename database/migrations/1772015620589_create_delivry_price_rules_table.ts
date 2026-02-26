import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'delivry_price_rules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('city')
      table.integer('min_weight')
      table.integer('max_weight')
      table.integer('price')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
