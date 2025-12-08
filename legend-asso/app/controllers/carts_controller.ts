<<<<<<< HEAD
import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class CartsController {
  public async addToCart({ request, session, response }: HttpContext) {
    const articleId = Number(request.input('articleId'))
    const quantity = Number(request.input('quantity')) || 1

    if (!articleId) {
      return response.badRequest({ message: "ID de l'article manquant" })
    }

    const article = await Article.find(articleId)
    if (!article) {
      return response.notFound({ message: 'Article introuvable.' })
    }

    // Récupérer le panier et s'assurer que cart.items est un tableau
    const cart = session.get('cart') || { items: [] }
    if (!Array.isArray(cart.items)) {
      cart.items = []
    }

    // Vérifier si l’article existe déjà dans le panier
    const existingItem = cart.items.find((item: { id: number }) => item.id === article.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({
        id: article.id,
        name: article.name,
        price: article.price,
        quantity,
      })
    }
    session.put('cart', cart)

    // Calcul totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return response.ok({
      message: 'Produit ajouté au panier.',
      cart,
      totalItems,
      totalPrice,
    })
  }

  public async getCart({ session, response }: HttpContext) {
    const cart = session.get('cart') || { items: [] }
    if (!Array.isArray(cart.items)) cart.items = []

    const totalItems = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    const totalPrice = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0) * (item.price || 0), 0)

    return response.ok({ cart, totalItems, totalPrice })
  }

  public async removeFromCart({ request, session, response }: HttpContext) {
    // Support both DELETE /api/cart/:id and body param { articleId }
    const paramId = Number(request.param('id'))
    const bodyId = Number(request.input('articleId'))
    const articleId = paramId || bodyId

    if (!articleId) {
      return response.badRequest({ message: "ID de l'article manquant" })
    }

    const cart = session.get('cart') || { items: [] }
    if (!Array.isArray(cart.items)) cart.items = []

    const initialLength = cart.items.length
    cart.items = cart.items.filter((item: any) => item.id !== articleId)

    // Save session
    session.put('cart', cart)

    const totalItems = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    const totalPrice = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0) * (item.price || 0), 0)

    if (cart.items.length === initialLength) {
      return response.notFound({ message: "Article non trouvé dans le panier." })
    }

    return response.ok({ message: 'Article supprimé du panier.', cart, totalItems, totalPrice })
  }

  public async clearCart({ session, response }: HttpContext) {
    const cart = { items: [] }
    session.put('cart', cart)

    return response.ok({ message: 'Panier vidé.', cart, totalItems: 0, totalPrice: 0 })
  }
}
=======
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
>>>>>>> e15151918d96fdc9505a1e2062728863df42b4da
