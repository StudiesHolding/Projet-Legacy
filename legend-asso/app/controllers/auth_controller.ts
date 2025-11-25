import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/register'
import { AuthValidator } from '#validators/auth'

export default class AuthController {

    public async register_client ({request , response, auth}: HttpContext) {
        const data = await request.validateUsing(createUserValidator)
        if (!data.role) {
            data.role = 'client'
        }
        const newUser = await User.create(data)
        await auth.use('web').login(newUser)
        return response.redirect().toRoute('dashboard-client')
    }

    public async register_seller ({request , response, auth}: HttpContext) {
        const data = await request.validateUsing(createUserValidator)
        if (!data.role) {
            data.role = 'seller'
        }
        const newUser = await User.create(data)
        await auth.use('web').login(newUser)
        return response.redirect().toRoute('dashboard-client')
    }

    public async login_client ({request , auth , response, session}: HttpContext){ 
        try {
            const payload = await request.validateUsing(AuthValidator)
            const user = await User.verifyCredentials(payload.email , payload.password)
            await auth.use('web').login(user)
            return response.redirect().toRoute('dashboard-client')
        } catch (error) {
            if (error.code === 'E_INVALID_CREDENTIALS') {
                session.flash('errors.login', ['Identifiants invalides (Email ou mot de passe incorrect).'])
                return response.redirect().back()
            }
            throw error 
        } 
    }

    public async logout_client({auth , response}:HttpContext){
        await auth.use('web').logout()
        return response.redirect('login')
    }

}
