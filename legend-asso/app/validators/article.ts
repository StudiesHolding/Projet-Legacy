import vine from '@vinejs/vine'

export const ArticleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    about: vine.string(),
    price: vine.number(),
    measure: vine.number(),
    available: vine.boolean().optional(),
    category_id: vine.number(),
    images: vine
      .array(
        vine.file({
          extnames: ['jpg', 'png', 'jpeg'],
        })
      )
      .minLength(1) // Optionnel : exige au moins 1 image
      .maxLength(5), // Optionnel : limite à 5 images
  })
)
