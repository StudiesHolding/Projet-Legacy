import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {

    public async register ({request , response, auth}: HttpContext) {
        const data = request.only(['name', 'email', 'phone', 'password'])
        console.log(data)
        const existingUser = await User.findBy('email',data.email)
        if (existingUser) {
            return response.badRequest('Cet email est déjà utilisé.')
        }
        const newUser = await User.create(data)
        await auth.use('web').login(newUser)
        return response.redirect().toRoute('dashboard-client')
    }

    public async login ({request , auth , response}:HttpContext){
        const { email, password } = request.only(['email', 'password'])
        const user = await User.verifyCredentials(email, password)
        await auth.use('web').login(user)
        response.redirect().toRoute('dashboard-client')
    }   

    public async logout({auth , response}:HttpContext){
        await auth.use('web').logout()
        return response.redirect('login')
    }

}
