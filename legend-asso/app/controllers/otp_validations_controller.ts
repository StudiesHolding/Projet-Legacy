import OtpVerification from '#models/otp_verification'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { DateTime } from 'luxon'

export default class OtpValidationsController {
  public async verifyOtp({ request, session, response, auth }: HttpContext) {
    const email = session.get('email')
    const registerData = session.get('registerData')
    const code = request.input('otp')

    if (!email || !registerData) {
      return response.badRequest({
        message: "Session expirée ou données d'inscription manquantes.",
      })
    }

    const otpRecord = await OtpVerification.query()
      .where('otpValue', code)
      .where('email', email)
      .where('status', 'unuse')
      .where('expireAt', '>', DateTime.now().toSQL())
      .first()

    if (!otpRecord) {
      return response.badRequest({ message: 'Code invalide ou expiré mouf.' })
    }

    try {
      const newUser = await User.create({
        name: registerData.name,
        email: email,
        phone: registerData.phone,
        password: registerData.password,
        role: registerData.role || 'client',
        isVerify: true,
      })

      await otpRecord.delete()
      session.forget('email')
      session.forget('registerData')

      await auth.use('web').login(newUser)
      let redirectUrl: string
      const targetUrl = session.get('targetUrl')

      if (targetUrl?.includes('/checkout')) {
        redirectUrl = router.makeUrl('payement')
      } else {
        redirectUrl = '/dashboard-client'
      }

      return response.ok({
        message: 'Vérification réussie !',
        redirectUrl: redirectUrl,
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Erreur lors de la création du compte.' })
    }
  }
}
