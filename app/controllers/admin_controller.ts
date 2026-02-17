import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { AdminValidator } from '#validators/admin'

export default class AdminController {
  public async home({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/index')
  }
  public async login({ view }: HttpContext) {
    return view.render('pages/dashboard/admin/login')
  }

  public async handleLogin({ view, request, auth }: HttpContext) {
    const data = await request.validateUsing(AdminValidator)
    const user = await User.verifyCredentials(data.email, data.password)
    console.log(user)
    auth.use('web').login(user)
    return view.render('pages/dashboard/admin/index')
  }
}
