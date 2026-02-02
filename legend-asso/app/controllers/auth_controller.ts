import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/register'
import { AuthValidator } from '#validators/auth'
import RequestService from '#services/request_service'
import OtpVerification from '#models/otp_verification'
import { DateTime } from 'luxon'

export default class AuthController {
  public async register_client({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)

    if (!data.role) {
      data.role = 'client'
    }
    const newUser = await User.create(data)

    if (!newUser.isVerify) {
      const otpCode = Math.floor(100000 + Math.random() * 900000)

      await OtpVerification.create({
        userId: newUser.id,
        otpValue: otpCode,
        expireAt: DateTime.now().plus({ minutes: 10 }),
      })

      // await auth.use('web').login(newUser)

      return response.redirect().toRoute('otp-page')
    }
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
        userId: newUser.id,
        otpValue: otpCode,
        expireAt: DateTime.now().plus({ minutes: 10 }),
      })

      return response.redirect().toPath('pages/otp-verification')
    }
    // await auth.use('web').login(newUser)

    // await auth.use('web').login(newUser)
    // return response.redirect().toRoute('dashboard-client')
  }

  public async login_client({ request, auth, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(AuthValidator)
      const user = await User.verifyCredentials(payload.email, payload.password)
      await auth.use('web').login(user)
      const forward = RequestService.getForwardUrl(payload.forward)
      if (forward) {
        return response.redirect().toPath(forward)
      }

      switch (user.role) {
        case 'seller':
          return response.redirect().toRoute('dashboard-seller')
        case 'client':
          return response.redirect().toRoute('dashboard-client')
        default:
          return response.redirect().toRoute('home')
      }
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        session.flash('errors.login', ['Identifiants invalides (Email ou mot de passe incorrect).'])
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
