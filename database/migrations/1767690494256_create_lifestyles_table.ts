import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lifestyles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('article_id')
        .unsigned()
        .references('id')
        .inTable('articles')
        .onDelete('CASCADE')
        .notNullable()

      table.jsonb('materials').nullable()
      table.jsonb('variants').nullable()
      table.jsonb('craftsmanship').nullable()
      table.jsonb('sizes').nullable()
      table.float('length').nullable()
      table.float('width').nullable()
      table.float('height').nullable()
      table.float('weight').nullable()

      table.string('style').nullable()
      table.string('usage').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
