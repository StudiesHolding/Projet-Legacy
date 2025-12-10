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
    const totalItems = cart.items.reduce(
      (sum: any, item: { quantity: any }) => sum + item.quantity,
      0
    )
    const totalPrice = cart.items.reduce(
      (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price,
      0
    )
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
    const totalPrice = cart.items.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0) * (item.price || 0),
      0
    )

    return response.ok({ cart, totalItems, totalPrice })
  }

  public async removeFromCart({ request, session, response }: HttpContext) {
    const paramId = Number(request.param('id'))
    const bodyId = Number(request.input('articleId'))
    const articleId = paramId || bodyId

    if (!articleId) {
      return response.badRequest({ message: "ID de l'article manquant" })
    }

    const cart = session.get('cart') || { items: [] }
    if (!Array.isArray(cart.items)) cart.items = []
    const initialLength = cart.items.length

    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item: any) => item.id === articleId)
    if (itemIndex === -1) {
      return response.notFound({ message: 'Article non trouvé dans le panier.' })
    }

    const item = cart.items[itemIndex]

    // If quantity > 1, decrement quantity by 1. Otherwise remove the item.
    if (item.quantity && item.quantity > 1) {
      item.quantity -= 1
    } else {
      cart.items.splice(itemIndex, 1)
    }

    // Save updated cart to session
    session.put('cart', cart)

    const totalItems = cart.items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0)
    const totalPrice = cart.items.reduce(
      (sum: number, it: any) => sum + (it.quantity || 0) * (it.price || 0),
      0
    )

    return response.ok({ message: 'Panier mis à jour.', cart, totalItems, totalPrice })
  }

  public async clearCart({ session, response }: HttpContext) {
    const cart = { items: [] }
    session.put('cart', cart)

    return response.ok({ message: 'Panier vidé.', cart, totalItems: 0, totalPrice: 0 })
  }
}
