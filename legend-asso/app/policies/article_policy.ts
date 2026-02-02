import User from '#models/user'
import Article from '#models/article'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ArticlePolicy extends BasePolicy {
  update(user: User, article: Article): AuthorizerResponse {
    return user.id === article.sellerId
  }

  show(user: User, article: Article): AuthorizerResponse {
    return user.id === article.sellerId
  }

  delete(user: User, article: Article): AuthorizerResponse {
    return user.id === article.sellerId
  }
}
