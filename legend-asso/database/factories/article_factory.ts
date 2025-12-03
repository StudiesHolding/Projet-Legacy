import factory from '@adonisjs/lucid/factories'
import Article from '#models/article'

export const ArticleFactory = factory
  .define(Article, async ({ faker }) => {
    return {}
  })
  .build()