import Article from '#models/article'
import stringHelpers from '@adonisjs/core/helpers/string'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'

const possibleStatuses = ['pending', 'accepted', 'refused']

export default class extends BaseSeeder {
  async run() {
    const articlesToCreate = 100
    const articleData = []

    for (let i = 0; i < articlesToCreate; i++) {
      const productName = faker.commerce.productName()

      articleData.push({
        name: productName,
        about: faker.commerce.productDescription(),
        price: faker.number.int({ min: 1000, max: 10000 }),
        slug: stringHelpers.slug(productName),
        category_id: faker.number.int({ min: 1, max: 7 }),
        seller_id: faker.number.int({ min: 1, max: 5 }),
        status: faker.helpers.arrayElement(possibleStatuses),
        available: faker.datatype.boolean(),
        isValidated: faker.datatype.boolean(),
        weight: faker.number.int({ min: 0.5, max: 20 }),
        stock: faker.number.int({ min: 0, max: 50 }),
        delivery_time: faker.number.int({ min: 1, max: 7 }),
        unit_value: faker.number.int({ min: 1, max: 100 }).toString(),
        unit_type: faker.helpers.arrayElement(['kg', 'liters', 'pieces']),
      })
    }
    await Article.createMany(articleData)
  }
}
