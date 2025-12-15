import Image from '#models/image'
import type { HttpContext } from '@adonisjs/core/http'

export default class ImagesController {
  async destroy({ params, response, session }: HttpContext) {
    const imageToDestroy = await Image.findOrFail(params.id)
    await imageToDestroy.delete()
    session.flash('success', 'la suppression a reussi')
    return response.redirect().toRoute('article.index')
  }
}
