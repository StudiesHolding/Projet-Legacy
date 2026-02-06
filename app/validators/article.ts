import vine from '@vinejs/vine'

export const ArticleValidator = vine.compile(
  vine.object({
    name: vine.string().unique(async (db, value) => {
      const article = await db.from('articles').where('name', value).first()
      return !article
    }),
    about: vine.string(),
    price: vine.number(),
    delivery_time: vine.number(),
    unit_value: vine.string(),
    unit_type: vine.string(),
    available: vine.boolean().optional(),
    category_id: vine.string(),
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
