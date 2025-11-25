
import User from '#models/user'
import { createUserValidator } from '#validators/register'
import { stepTwoValidator } from '#validators/step_two'
import type { HttpContext } from '@adonisjs/core/http'

export default class SellerRegistrationsController {
    public async handleStepOne({request , response , session}:HttpContext){
        const payload = await request.validateUsing(createUserValidator)
        session.put('registration_data',payload)
        response.redirect().toRoute('register-supplier-2')
    }

    public async stepTwo({ response , session}:HttpContext){
        if(!session.has('registration_data')){
            session.flash('error','Veuillez remplir la première étape')
            return response.redirect().toRoute('register-supplier-1')
        }
        return response.redirect().toRoute('register-supplier-2')
    }

    public async finalize({request , response , auth , session}:HttpContext){
        const stepOneData = session.get('registration_data')
        if(!stepOneData){
            session.flash('error', 'Session expirée ou étape précédente non complétée.')
            return response.redirect().toRoute('register-supplier-1')
        }
        const stepTwoData = await request.validateUsing(stepTwoValidator)
        const finalData = {...stepOneData , ...stepTwoData}
        const newUser = await User.create(finalData)

        session.forget('registration_data')
        await auth.use('web').login(newUser)
        return response.redirect().toRoute('dashboard-seller')
    }

}