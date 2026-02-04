import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/register'
import { AuthValidator } from '#validators/auth'
import OtpVerification from '#models/otp_verification'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import router from '@adonisjs/core/services/router'

export default class AuthController {
  public async register_client({ session, request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    session.put('registerData', data)

    if (!data.role) {
      data.role = 'client'
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000)

    await OtpVerification.create({
      email: data.email,
      otpValue: otpCode,
      expireAt: DateTime.now().plus({ minutes: 10 }),
    })

    await mail.send((message) => {
      message
        .to(data.email)
        .from('onboarding@resend.dev')
        .subject("Email de vérification d'email")
        .htmlView('mail/email-verification', { data, otpCode })
    })

    session.put('email', data.email)

    return response.redirect().toRoute('otp-page')
  }

  public async register_seller({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    if (!data.role) {
      data.role = 'seller'
    }

    const newUser = await User.create(data)
    if (!newUser.isVerify) {
      const otpCode = Math.floor(100000 + Math.random() * 900000)

      await OtpVerification.create({
        // userId: newUser.id,
        otpValue: otpCode,
        expireAt: DateTime.now().plus({ minutes: 10 }),
      })

      return response.redirect().toPath('pages/otp-verification')
    }
  }

  public async login_client({ request, auth, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(AuthValidator)
      const user = await User.verifyCredentials(payload.email, payload.password)

      await auth.use('web').login(user)

      let targetUrl = request.input('intended_url')

      if (targetUrl && targetUrl.includes('checkout')) {
        targetUrl = router.makeUrl('payement')
      }

      if (targetUrl && targetUrl.includes('checkout')) {
        targetUrl = router.makeUrl('payement')
      }

      if (user.role === 'seller') {
        return targetUrl
          ? response.redirect().toPath(targetUrl)
          : response.redirect().toRoute('dashboard-seller')
      }

      if (user.role === 'client') {
        return targetUrl
          ? response.redirect().toPath(targetUrl)
          : response.redirect().toRoute('dashboard-client')
      }

      return response.redirect().toRoute('home')
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        session.flash('errors.login', ['Identifiants invalides.'])
        return response.redirect().back()
      }
      throw error
    }
  }

  public async logout_client({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('login')
  }
}
