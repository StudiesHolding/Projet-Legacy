// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'
// import type { Authenticators } from '@adonisjs/auth/types'

// /**
//  * Auth middleware is used authenticate HTTP requests and deny
//  * access to unauthenticated users.
//  */
// export default class AuthMiddleware {
//   /**
//    * The URL to redirect to, when authentication fails
//    */
//   redirectTo = '/login'

//   async handle(
//     ctx: HttpContext,
//     next: NextFn,
//     options: {
//       guards?: (keyof Authenticators)[]
//     } = {}
//   ) {
//     await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
//     return next()
//   }
// }

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  /**
   * On garde une valeur par défaut pour la sécurité,
   * mais elle sera ignorée par notre logique dynamique.
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    // 1. Déterminer la route de redirection dynamiquement
    let loginRoute = this.redirectTo

    if (ctx.request.url().startsWith('/admin-space')) {
      loginRoute = '/admin-space/login'
      // Note : Tu peux aussi utiliser ctx.router.makeUrl('admin.login')
      // si tu préfères utiliser le nom de la route.
    }

    // 2. Passer cette route à la méthode authenticateUsing
    await ctx.auth.authenticateUsing(options.guards, { loginRoute })

    return next()
  }
}
