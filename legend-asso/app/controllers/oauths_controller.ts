import type { HttpContext } from '@adonisjs/core/http'
import ally from '#config/ally'

export default class OauthsController {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  public async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  public async callback({ ally, auth, response }: HttpContext) {
    const google = ally.use('google')

    /**
     * User has denied access by canceling
     * the login flow
     */
    if (google.accessDenied()) {
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
    const user = await google.user()
    return user
  }
}
