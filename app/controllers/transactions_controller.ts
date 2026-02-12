import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import env from '#start/env'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import PhoneNumber from '#models/phone_number'
import Adress from '#models/adress'

export default class TransactionsController {
  private get isSandbox() {
    return env.get('PAWAPAY_MODE') === 'sandbox'
  }

  private get PAWAPAY_KEY() {
    return this.isSandbox ? env.get('PAWAPAY_SANDBOX_KEY') : env.get('PAWAPAY_PRODUCTION_KEY')
  }

  private get PAWAPAY_URL() {
    return this.isSandbox ? env.get('PAWAPAY_SANDBOX_URL') : env.get('PAWAPAY_PRODUCTION_URL')
  }

  /**
   * Initialise la transaction auprès de PawaPay
   */
  public async initiateTransaction({ auth, response, request, session }: HttpContext) {
    try {
      const number = request.input('number')
      const totalPrice = session.get('totalPrice')

      // 1. Création de l'enregistrement local de transaction
      const savedTransaction = await Transaction.create({
        buyerId: auth.user!.id,
        totalPrice: totalPrice,
        status: 'pending',
      })

      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.PAWAPAY_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId: `${savedTransaction.id}`,
          payer: {
            type: 'MMO',
            accountDetails: {
              phoneNumber: Number(number),
              provider: 'ORANGE_CMR', // Tu peux ajouter une logique pour détecter MTN/ORANGE ici
            },
          },
          amount: `${totalPrice}`,
          currency: 'XAF',
          preAuthorisationCode: 'none',
          clientReferenceId: `LEGACI-${savedTransaction.id}`,
          customerMessage: `Payment`,
          metadata: [{ orderId: `${savedTransaction.id}` }],
        }),
      }

      const apiResponse = await fetch(this.PAWAPAY_URL, options)
      const res: any = await apiResponse.json()
      console.log('juste pour tester')
      console.log(res, '...............................')

      // Cas 1 : PawaPay a accepté de traiter la demande (le téléphone va vibrer)
      if (res.status === 'ACCEPTED') {
        savedTransaction.status = 'accepted'
        await savedTransaction.save()

        return response.json({
          status: 'accepted',
          reference: savedTransaction.id,
        })
      }

      // Cas 2 : PawaPay rejette immédiatement (ex: numéro mal formé)
      else {
        const errorCode = res.failureReason?.failureCode || 'FAILED'
        savedTransaction.status = 'refused'
        savedTransaction.note = res.failureReason?.failureMessage || 'REJECTED_BY_GATEWAY'
        await savedTransaction.save()

        return response.status(400).json({
          status: 'failed',
          reason: errorCode, // Renvoie 'PAYER_NOT_FOUND', etc.
        })
      }
    } catch (error) {
      console.error('Erreur initiation:', error)
      return response.status(500).json({ error: 'Serveur de paiement indisponible' })
    }
  }

  /**
   * Vérifie le statut réel de la transaction (Polling déclenché par le front)
   */
  public async checkStatus({ auth, response, request, session }: HttpContext) {
    const depositId = request.input('reference')
    const data = request.input('data')
    console.log('data.............................................', data)

    try {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
      }

      const apiResponse = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
      if (!apiResponse.ok) throw new Error(`Erreur HTTP: ${apiResponse.status}`)

      const res: any = await apiResponse.json()

      // PawaPay renvoie souvent les détails dans un tableau data[] ou objet direct
      const transactionData = Array.isArray(res.data) ? res.data[0] : res.data

      const pawapayStatus = transactionData?.status // 'COMPLETED', 'FAILED', 'PENDING'
      const failureCode = transactionData?.failureReason?.failureCode // Ex: 'INSUFFICIENT_BALANCE'
      // console.log('Statut PawaPay:', pawapayStatus, 'FailureCode:', failureCode)

      // SUCCESS : Le client a tapé son code PIN
      if (pawapayStatus === 'COMPLETED') {
        const existingOrder = await Order.findBy('transactionId', depositId)

        if (!existingOrder) {
          const newOrder = await Order.create({
            status: 'pending',
            buyerId: auth.user?.id,
            phoneNumber: data.phone,
            paymentMethod: data.payment_method,
            totalPrice: transactionData.amount,
            transactionId: depositId,
          })

          await PhoneNumber.create({
            userId: auth?.user?.id,
            orderId: newOrder.id,
            phoneNumber: data.phone,
          })

          await Adress.create({
            adress: data?.address,
            orderId: newOrder.id,
            userId: auth.user?.id,
          })

          const cart = session.get('cart')
          const items = cart?.items || []

          for (const item of items) {
            await OrderItem.create({
              reference: item.id,
              quantity: item.quantity,
              status: 'pending',
              name: item.name,
              orderId: newOrder.id,
              priceAtPurchase: item.price,
              sellerId: item.sellerId,
            })
          }

          // On vide le panier après succès
          session.forget('cart')
          session.forget('totalItems')
          session.forget('totalPrice')
        }

        return response.json({ status: 'completed' })
      }

      // ECHEC : Le client n'a pas pu payer
      if (pawapayStatus === 'FAILED') {
        // Mise à jour de la transaction en base pour historique
        const txn = await Transaction.find(depositId)
        console.log(txn)
        if (txn) {
          txn.status = 'refused'
          txn.note = failureCode || 'FAILED'
          await txn.save()
        }

        return response.json({
          status: 'failed',
          reason: failureCode || 'FAILED', // C'est ici qu'on envoie 'INSUFFICIENT_BALANCE'
        })
      }

      // EN ATTENTE : Toujours en attente de la saisie du code PIN
      return response.json({ status: pawapayStatus })
    } catch (error) {
      console.error('Erreur checkStatus:', error)
      return response.status(500).json({ error: 'Erreur de communication avec PawaPay' })
    }
  }
}
