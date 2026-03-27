import { createUserValidator } from '#validators/register'
// import { stepTwoValidator } from '#validators/step_two'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import string from '@adonisjs/core/helpers/string'
import Seller from '#models/seller'

const REGISTER_SUPPLIER_1_ROUTE = 'register-supplier-1'
const REGISTER_SUPPLIER_2_ROUTE = 'register-supplier-2'
const DASHBOARD_SELLER_ROUTE = 'dashboard-seller'
const DEFAULT_ROLE = 'seller'
const SESSION_KEY = 'registration_data'

export default class SellerRegistrationsController {
  public async handleStepOne({ request, response, session }: HttpContext) {
    console.log('badaboom')
    console.log('**************************** badaboom *******************************')
    const payload = await request.validateUsing(createUserValidator)
    const slug = string.slug(request.input('name'))
    const updatedPayload = { ...payload, slug }

    session.put(SESSION_KEY, updatedPayload)
    return response.redirect().toRoute(REGISTER_SUPPLIER_2_ROUTE)
  }

  public async stepTwo({ response, session }: HttpContext) {
    if (!session.has(SESSION_KEY)) {
      session.flash('error', 'Veuillez remplir la première étape avant de continuer.')
      return response.redirect().toRoute(REGISTER_SUPPLIER_1_ROUTE)
    }
    return response.redirect().toRoute(REGISTER_SUPPLIER_2_ROUTE)
  }

  public async finalize({ response, auth, session }: HttpContext) {
    const stepOneData = session.get(SESSION_KEY)
    if (!stepOneData || typeof stepOneData !== 'object') {
      session.flash(
        'error',
        'Session expirée ou étape précédente non complétée. Veuillez recommencer.'
      )
      return response.redirect().toRoute(REGISTER_SUPPLIER_1_ROUTE)
    }
    console.log('*****************************************************', stepOneData)
    try {
      const user = await Seller.create({
        ...stepOneData,
        role: DEFAULT_ROLE,
      })
      await auth.use('web').login(user)

      return response.redirect().toRoute(DASHBOARD_SELLER_ROUTE)
    } catch (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        session.flash(
          'error',
          "L'adresse e-mail est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
        )
      } else {
        session.flash('error', "Une erreur inattendue est survenue lors de l'inscription.")
      }
      console.error("Erreur lors de la finalisation de l'inscription:", error)
      return response.redirect().toRoute(REGISTER_SUPPLIER_2_ROUTE)
    }
  }
}
