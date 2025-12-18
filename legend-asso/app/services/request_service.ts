import router from '@adonisjs/core/services/router'

export default class RequestService {
  static getForwardUrl(forward?: string) {
    if (!forward) return null
    try {
      const url = new URL(forward)
      const route = router.match(url.pathname, 'GET')

      if (route) {
        return url.pathname + url.search
      }
    } catch (error) {
      return null
    }
  }
}
