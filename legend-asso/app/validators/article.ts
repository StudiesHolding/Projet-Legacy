import vine from '@vinejs/vine'

export const ArticleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    about: vine.string(),
    price: vine.number(),
    delivery_time: vine.number().optional(),
    unit_value: vine.string().optional(),
    unit_type: vine.string().optional(),
    available: vine.boolean().optional(),
    category_id: vine.number(),
    certification: vine.array(vine.string()).optional(),
    ingredient: vine.array(vine.string()).optional(),
    expiration_date: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    conservation_advice: vine.string().trim().optional(),
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
