// // import type { HttpContext } from '@adonisjs/core/http'
// // import Transaction from '#models/transaction'
// // import env from '#start/env'
// // import Order from '#models/order'
// // import OrderItem from '#models/order_item'

// // const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
// // export default class TransactionsController {
// //   private get isSandbox() {
// //     return env.get('PAWAPAY_MODE') === 'sandbox'
// //   }

// //   private get PAWAPAY_KEY() {
// //     return this.isSandbox ? env.get('PAWAPAY_SANDBOX_KEY') : env.get('PAWAPAY_PRODUCTION_KEY')
// //   }

// //   private get PAWAPAY_URL() {
// //     return this.isSandbox ? env.get('PAWAPAY_SANDBOX_URL') : env.get('PAWAPAY_PRODUCTION_URL')
// //   }

// //   public async index() {
// //     console.log('Transactions index method called')
// //   }

// //   public generateOTP() {
// //     const otpCode = Math.floor(100000 + Math.random() * 900000)
// //     return otpCode
// //   }

// //   // Usage

// //   public async initiateTransaction({ auth, response, request, session }: HttpContext) {
// //     const payload = await request.all()
// //     console.log('............................................................')
// //     const number = await Number(request.input('number'))
// //     console.log('Voici mon numéro ici', number)
// //     console.log(typeof number)
// //     console.log('............................................................')
// //     const phoneNumber = number
// //     const totalPrice = session.get('totalPrice')
// //     const newTransaction = await Transaction.create({
// //       buyerId: auth.user!.id,
// //       totalPrice: totalPrice,
// //       status: 'pending',
// //     })
// //     const savedTransaction = await newTransaction.save()

// //     const options = {
// //       method: 'POST',
// //       headers: {
// //         'Authorization': `Bearer ${this.PAWAPAY_KEY}`,
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         depositId: `${savedTransaction.id}`,
// //         payer: {
// //           type: 'MMO',
// //           accountDetails: { phoneNumber: `${phoneNumber}`, provider: 'ORANGE_CMR' },
// //         },
// //         amount: `${totalPrice}`,
// //         currency: 'XAF',
// //         preAuthorisationCode: 'juste',
// //         clientReferenceId: `CLIENT-${auth.user!.id}-TXN-${savedTransaction.id}`,
// //         customerMessage: 'Note of 4 to 22 chars',
// //         metadata: [{ orderId: 'ORD-123456789' }, { customerId: `${auth.user!.id}`, isPII: true }],
// //       }),
// //     }

// //     try {
// //       // 1. On attend la réponse de l'API (await est crucial ici)
// //       const apiResponse = await fetch(this.PAWAPAY_URL, options)
// //       const res: any = await apiResponse.json()

// //       console.log(request.all())

// //       console.log('Réponse pawapay:', res)
// //       switch (res.status) {
// //         case 'ACCEPTED':
// //           savedTransaction.status = 'accepted'
// //           await savedTransaction.save()
// //           console.log('transaction accepté par pawapay')
// //           response.redirect().toRoute('transaction.checkStatus', { id: savedTransaction.id })
// //           break
// //         case 'REJECTED':
// //           savedTransaction.status = 'refused'
// //           savedTransaction.note = res.failureReason.failureMessage
// //           await savedTransaction.save()
// //           console.log('transaction refusé par pawapay')
// //           break
// //         case 'DUPLICATE_IGNORED':
// //           savedTransaction.status = 'refused'
// //           savedTransaction.note = 'you cannot duplicate transactions'
// //           await savedTransaction.save()
// //           console.log(res)
// //           console.log('transaction refusé par pawapay')
// //           break
// //         default:
// //           console.log(options)
// //           savedTransaction.status = 'refused'
// //           savedTransaction.note = 'probleme bizzare'
// //           await savedTransaction.save()
// //           console.log('transaction refusé par pawapay')
// //           break
// //       }
// //     } catch (error) {
// //       console.error('Erreur lors de la requête de paiement:', error)
// //     }
// //   }

// //   // public async checkStatus({ auth, params, response, session }: HttpContext) {
// //   //   const depositId = params.id
// //   //   try {
// //   //     const options = {
// //   //       method: 'GET',
// //   //       headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
// //   //     }

// //   //     const apiResponse: any = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
// //   //     if (!apiResponse.ok) {
// //   //       throw new Error(`Erreur HTTP: ${apiResponse.status}`)
// //   //     }
// //   //     const res = await apiResponse.json()
// //   //     const pawapayStatus = res.data.status

// //   //     if (pawapayStatus === 'COMPLETED') {
// //   //       const newOrder = await Order.create({
// //   //         status: 'pending',
// //   //         buyerId: auth.user?.id,
// //   //         totalPrice: res.data.amount,
// //   //         transactionId: res.data.depositId,
// //   //       })
// //   //       // creation du des orderItems
// //   //       const { items } = session.get('cart')

// //   //       for (const item of items) {
// //   //         await OrderItem.create({
// //   //           reference: item.id,
// //   //           quantity: item.quantity,
// //   //           status: 'pending',
// //   //           name: item.name,
// //   //           orderId: newOrder.id,
// //   //           priceAtPurchase: item.price,
// //   //           sellerId: item.sellerId,
// //   //         })
// //   //       }

// //   //       // Nettoie le panier
// //   //       session.forget('cart')
// //   //       session.forget('totalItems')
// //   //       session.forget('totalPrice')

// //   //       await sleep(20000)
// //   //       return pawapayStatus
// //   //     }
// //   //   } catch (error) {
// //   //     console.error('Erreur lors de la vérification:', error)
// //   //     session.flash('error', 'Impossible de vérifier le statut de la transaction.')
// //   //     return response.redirect().toRoute('dashboard.client')
// //   //   }
// //   // }

// //   public async checkStatus({ auth, params, response, session }: HttpContext) {
// //     const depositId = params.id

// //     try {
// //       const options = {
// //         method: 'GET',
// //         headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
// //       }

// //       const apiResponse: any = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)

// //       if (!apiResponse.ok) {
// //         throw new Error(`Erreur HTTP: ${apiResponse.status}`)
// //       }

// //       const res = await apiResponse.json()
// //       const pawapayStatus = res.data[0]?.status || res.data.status

// //       if (pawapayStatus === 'COMPLETED') {
// //         const existingOrder = await Order.findBy('transactionId', res.data.depositId)

// //         if (!existingOrder) {
// //           const newOrder = await Order.create({
// //             status: 'pending',
// //             buyerId: auth.user?.id,
// //             totalPrice: res.data.amount,
// //             transactionId: res.data.depositId,
// //           })

// //           const cart = session.get('cart')
// //           const items = cart?.items || []

// //           for (const item of items) {
// //             await OrderItem.create({
// //               reference: item.id,
// //               quantity: item.quantity,
// //               status: 'pending',
// //               name: item.name,
// //               orderId: newOrder.id,
// //               priceAtPurchase: item.price,
// //               sellerId: item.sellerId,
// //             })
// //           }
// //           session.forget('cart')
// //           session.forget('totalItems')
// //           session.forget('totalPrice')
// //         }

// //         await sleep(20000)

// //         return response.json({ status: 'completed' })
// //       }

// //       // Si pas encore complété
// //       return response.json({ status: pawapayStatus })
// //     } catch (error) {
// //       console.error('Erreur lors de la vérification:', error)
// //       return response.status(500).json({ error: 'Erreur de vérification' })
// //     }
// //   }
// // }

// import type { HttpContext } from '@adonisjs/core/http'
// import Transaction from '#models/transaction'
// import env from '#start/env'
// import Order from '#models/order'
// import OrderItem from '#models/order_item'

// // const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// export default class TransactionsController {
//   private get isSandbox() {
//     return env.get('PAWAPAY_MODE') === 'sandbox'
//   }

//   private get PAWAPAY_KEY() {
//     return this.isSandbox ? env.get('PAWAPAY_SANDBOX_KEY') : env.get('PAWAPAY_PRODUCTION_KEY')
//   }

//   private get PAWAPAY_URL() {
//     return this.isSandbox ? env.get('PAWAPAY_SANDBOX_URL') : env.get('PAWAPAY_PRODUCTION_URL')
//   }

//   /**
//    * Initialise la transaction auprès de PawaPay
//    */
//   public async initiateTransaction({ auth, response, request, session }: HttpContext) {
//     try {
//       const number = request.input('number')
//       const totalPrice = session.get('totalPrice')

//       // 1. Création de l'enregistrement local de transaction
//       const savedTransaction = await Transaction.create({
//         buyerId: auth.user!.id,
//         totalPrice: totalPrice,
//         status: 'pending',
//       })

//       const options = {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${this.PAWAPAY_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           depositId: `${savedTransaction.id}`,
//           payer: {
//             type: 'MMO',
//             accountDetails: {
//               phoneNumber: `${number}`,
//               provider: 'ORANGE_CMR', // À dynamiser selon l'opérateur si besoin
//             },
//           },
//           amount: `${totalPrice}`,
//           currency: 'XAF',
//           preAuthorisationCode: 'none',
//           clientReferenceId: `CLIENT-${auth.user!.id}-TXN-${savedTransaction.id}`,
//           customerMessage: `Paiement Legaci Store`,
//           metadata: [{ orderId: `TXN-${savedTransaction.id}` }, { customerId: `${auth.user!.id}` }],
//         }),
//       }

//       const apiResponse = await fetch(this.PAWAPAY_URL, options)
//       const res: any = await apiResponse.json()

//       // 2. Gestion de la réponse immédiate de l'initiation
//       if (res.status === 'ACCEPTED') {
//         savedTransaction.status = 'accepted'
//         await savedTransaction.save()
//         return response.json({
//           status: 'accepted',
//           reference: savedTransaction.id,
//         })
//       } else {
//         savedTransaction.status = 'refused'
//         savedTransaction.note = res.failureReason?.failureMessage || 'REJECTED'
//         await savedTransaction.save()

//         return response.status(400).json({
//           status: 'failed',
//           reason: res.failureReason?.failureCode || 'FAILED',
//         })
//       }
//     } catch (error) {
//       console.error('Erreur initiation:', error)
//       return response.status(500).json({ error: "Erreur lors de l'initiation du paiement" })
//     }
//   }

//   /**
//    * Vérifie le statut réel de la transaction (Polling)
//    */
//   public async checkStatus({ auth, params, response, session }: HttpContext) {
//     const depositId = params.id

//     try {
//       const options = {
//         method: 'GET',
//         headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
//       }

//       const apiResponse = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
//       if (!apiResponse.ok) throw new Error(`Erreur HTTP: ${apiResponse.status}`)

//       const res = await apiResponse.json()

//       // PawaPay renvoie souvent les détails dans un tableau data[]
//       const transactionData = Array.isArray(res.data) ? res.data[0] : res.data
//       const pawapayStatus = transactionData?.status
//       const failureCode = transactionData?.failureCode // Récupère la raison de l'échec

//       if (pawapayStatus === 'COMPLETED') {
//         // Vérification anti-doublon pour la commande
//         const existingOrder = await Order.findBy('transactionId', depositId)

//         if (!existingOrder) {
//           const newOrder = await Order.create({
//             status: 'pending',
//             buyerId: auth.user?.id,
//             totalPrice: transactionData.amount,
//             transactionId: depositId,
//           })

//           const cart = session.get('cart')
//           const items = cart?.items || []

//           for (const item of items) {
//             await OrderItem.create({
//               reference: item.id,
//               quantity: item.quantity,
//               status: 'pending',
//               name: item.name,
//               orderId: newOrder.id,
//               priceAtPurchase: item.price,
//               sellerId: item.sellerId,
//             })
//           }

//           // Nettoyage de la session
//           session.forget('cart')
//           session.forget('totalItems')
//           session.forget('totalPrice')
//         }

//         return response.json({ status: 'completed' })
//       }

//       if (pawapayStatus === 'FAILED') {
//         return response.json({
//           status: 'failed',
//           reason: failureCode || 'FAILED',
//         })
//       }

//       // Si toujours en attente (PENDING)
//       return response.json({ status: pawapayStatus })
//     } catch (error) {
//       console.error('Erreur checkStatus:', error)
//       return response.status(500).json({ error: 'Erreur technique de vérification' })
//     }
//   }
// }

import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import env from '#start/env'
import Order from '#models/order'
import OrderItem from '#models/order_item'

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
  public async checkStatus({ auth, params, response, session }: HttpContext) {
    const depositId = params.id

    try {
      const options = {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.PAWAPAY_KEY}` },
      }

      const apiResponse = await fetch(`${this.PAWAPAY_URL}/${depositId}`, options)
      if (!apiResponse.ok) throw new Error(`Erreur HTTP: ${apiResponse.status}`)

      const res = await apiResponse.json()

      // PawaPay renvoie souvent les détails dans un tableau data[] ou objet direct
      const transactionData = Array.isArray(res.data) ? res.data[0] : res.data

      const pawapayStatus = transactionData?.status // 'COMPLETED', 'FAILED', 'PENDING'
      const failureCode = transactionData?.failureCode // Ex: 'INSUFFICIENT_BALANCE'

      // SUCCESS : Le client a tapé son code PIN
      if (pawapayStatus === 'COMPLETED') {
        const existingOrder = await Order.findBy('transactionId', depositId)

        if (!existingOrder) {
          const newOrder = await Order.create({
            status: 'pending',
            buyerId: auth.user?.id,
            totalPrice: transactionData.amount,
            transactionId: depositId,
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
        if (txn) {
          txn.status = 'refused'
          txn.note = failureCode
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
