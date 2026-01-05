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
        price: faker.number.int({ min: 1000, max: 100000 }),
        slug: stringHelpers.slug(productName),
        category_id: faker.number.int({ min: 1, max: 7 }),
        seller_id: faker.number.int({ min: 1, max: 5 }),
        status: faker.helpers.arrayElement(possibleStatuses),
        available: faker.datatype.boolean(),
      })
    }
    await Article.createMany(articleData)
  }
}
