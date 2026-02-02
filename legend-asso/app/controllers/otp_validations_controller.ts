import type { HttpContext } from '@adonisjs/core/http'

export default class OtpValidationsController {
  public async verifyOtp({ params, auth, response }: HttpContext) {
    console.log('adonis')
  }
}
