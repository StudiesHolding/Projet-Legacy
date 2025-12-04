// import type { HttpContext } from '@adonisjs/core/http'
// import Article from '#models/article'

// export default class CartsController {
//   public async addToCart({ response, request, session }: HttpContext) {
//     const articleId = request.input('articleId')
//     console.log(articleId)

//     if (!articleId) {
//       return response.badRequest({ message: "L'ID de l'article est manquant." })
//     }

//     const article = await Article.find(articleId)

//     if (!article) {
//       return response.notFound({ message: `Article avec l'ID ${articleId} introuvable.` })
//     }

//     let cart = session.get('cart', {})
//     session.forget(cart)

//     const id = article.id.toString()

//     if (cart[id]) {
//       cart[id].quantity += 1
//     } else {
//       cart[id] = {
//         article: article.toJSON(),
//         quantity: 1,
//       }
//     }

//     session.put('cart', cart)

//     return response.ok({
//       message: `Article ${article.name} ajouté au panier !`,
//       cart: cart,
//       totalItems: Object.values(cart).reduce((sum, item: any) => sum + item.quantity, 0),
//     })
//   }
// }


import type { HttpContext } from '@adonisjs/core/http'
import Article from '#models/article'

export default class CartsController {
  public async addToCart({ response, request, session }: HttpContext) {
    const articleId = request.input('articleId')
    console.log(articleId)

    if (!articleId) {
      return response.badRequest({ message: "L'ID de l'article est manquant." })
    }

    const article = await Article.find(articleId)

    if (!article) {
      return response.notFound({ message: `Article avec l'ID ${articleId} introuvable.` })
    }

    // 1. Récupération du panier existant. Si inexistant, utilise {}.
    let cart = session.get('cart', {})
    // ATTENTION : La ligne session.forget(cart) a été SUPPRIMÉE ici.

    const id = article.id.toString()

    // 2. Logique de mise à jour/ajout
    if (cart[id]) {
      cart[id].quantity += 1
    } else {
      cart[id] = {
        article: article.toJSON(),
        quantity: 1,
      }
    }

    // 3. Remplacement de l'ancien panier par le nouveau panier mis à jour
    session.put('cart', cart) 

    return response.ok({
      message: `Article ${article.name} ajouté au panier !`,
      cart: cart,
      totalItems: Object.values(cart).reduce((sum, item: any) => sum + item.quantity, 0),
    })
  }
}