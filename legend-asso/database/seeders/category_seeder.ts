import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const possibleCategories = [
  'Agroalimentaire',
  'Cosmetique',
  'Service',
  'Mode/Artisanat',
  'Tourisme',
  'BTP',
  'Innovation',
]

export default class extends BaseSeeder {
  async run() {
    const categoriesData = possibleCategories.map((name) => {
      return { name: name }
    })
    await Category.createMany(categoriesData)
  }
}
