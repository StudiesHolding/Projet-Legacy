import { registerStepTwoValidator } from '#validators/step_two'
import { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { createUserValidator } from '#validators/register'
import Client from '#models/client'
import { inject } from '@adonisjs/core'
import router from '@adonisjs/core/services/router'
import Seller from '#models/seller'

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}

  public async register_client(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createUserValidator)
    data.role = 'client'
    await this.authService.sendOtp(data)
    ctx.session.put('email', data.email)
    ctx.session.put('stepOneData', data)
    console.log(data.email)
    return ctx.response.redirect().toRoute('otp-page')
  }

  public async handleOtpVerification(ctx: HttpContext) {
    const email = ctx.session.get('email')
    const otp = ctx.request.input('otp')
    const response = await this.authService.verifyOtp(email, otp)
    const data = ctx.session.get('stepOneData')
    console.log('veriication otp terminé')
    if (response === true) {
      if (data.role === 'client') {
        return this.CreateClient(data, ctx)
      }
      if (data.role === 'seller') {
        console.log('veriication validé pour les vendeurs')
        return this.redirectToStepTwo(ctx)
      }
    }
    if (!response) {
      return ctx.response.redirect().back()
    }
  }

  public async registerSeller({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    data.role = 'seller'
    session.put('stepOneData', data)
    session.put('email', data.email)
    await this.authService.sendOtp(data)
    console.log('2')
    return response.redirect().toRoute('otp-page')
  }

  public async CreateClient(data: any, ctx: HttpContext) {
    console.log('Data', data)
    console.log('me voici dans le createClient')
    const newClient = await Client.create({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    console.log("création de l'utilisateur terminé")
    await ctx.auth.use('web').login(newClient)
    console.log('connexion et redirection')
    const url = router.makeUrl('dashboard-client')
    return {
      status: 200,
      redirectUrl: url,
    }
  }

  public async redirectToStepTwo(ctx: HttpContext) {
    const url = router.makeUrl('register-supplier-2')
    return {
      status: 200,
      redirectUrl: url,
    }
    // return ctx.response.redirect().toRoute('register-supplier-2')
  }

  public async loginClient({ request, auth, response, session }: HttpContext) {
    try {
      const email = request.input('email')
      const password = request.input('password')

      const newClient = await Client.verifyCredentials(email, password)
      await auth.use('web').login(newClient)

      const intendedUrl = request.input('intended_url')
      console.log('intendedUrl =>', intendedUrl)
      const targetPath = await this.authService.getTargetUrl(newClient, intendedUrl)

      return response.redirect().toPath(targetPath)
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        session.flash('errors.login', 'Identifiants invalides.')
        return response.redirect().back()
      }
      throw error
    }
  }

  public async handleStepOne() {
    this.authService.handleStepOne()
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }

  public async finalize(ctx: HttpContext) {
    const stepOneData = ctx.session.get('stepOneData')
    const stepTwoData = await ctx.request.validateUsing(registerStepTwoValidator)
    console.log('malien')
    const newSeller = await Seller.create({
      name: stepOneData.name,
      email: stepOneData.email,
      password: stepOneData.password,
      role: 'seller',
      isVerify: true,
      isMember: stepTwoData.is_member,
      memberCode: stepTwoData.member_code,
      location: stepTwoData.location,
    })
    console.log('mboléman')

    await ctx.auth.use('web').login(newSeller)

    ctx.session.forget('stepOneData')
    ctx.session.forget('email')

    return ctx.response.redirect().toRoute('dashboard-seller')
  }
}
