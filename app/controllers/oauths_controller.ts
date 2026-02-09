import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

export default class OauthsController {
  public async redirect({ ally }: HttpContext) {
    const callbackUrl = router.makeUrl('callback')
    console.log(callbackUrl)
    return ally.use('google').redirect()
  }

  public async callback({ ally, auth, session, response }: HttpContext) {
    const google = ally.use('google')

    /**
     * User has denied access by canceling
     * the login flow
     */
    if (google.accessDenied()) {
      console.log('callback refusé')
      return 'You have cancelled the login process'
    }

    /**
     * OAuth state verification failed. This happens when the
     * CSRF cookie gets expired.
     */
    if (google.stateMisMatch()) {
      return 'We are unable to verify the request. Please try again'
    }

    /**
     * google responded with some error
     */
    if (google.hasError()) {
      return google.getError()
    }

    /**
     * Access user info
     */
    const googleUser = await google.user()

    const targetUrl = session.get('targetUrl') || router.makeUrl('dashboard-client')
    console.log('Voici la route cible', targetUrl)
    let redirectUrl
    if (targetUrl.includes('/checkout')) {
      redirectUrl = router.makeUrl('payement')
    } else {
      redirectUrl = router.makeUrl('dashboard-client')
    }
    console.log(redirectUrl)
    let user = await User.findBy('email', googleUser.email)

    if (!user) {
      const newUser = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        avatarUrl: googleUser.avatarUrl,
        role: 'client',
        isVerify: true,
      })
      await auth.use('web').login(newUser)
      console.log('redirection vers', targetUrl)
      session.forget('targetUrl')
      return response.redirect().toPath(redirectUrl)
    } else {
      user.googleId = googleUser.id
      await auth.use('web').login(user)
      console.log('redirection vers', targetUrl)
      session.forget('targetUrl')
      return response.redirect().toPath(redirectUrl)
    }
  }
}
