import vine from '@vinejs/vine'

export const AgrofoodValidator = vine.compile(
  vine.object({
    certification: vine.array(vine.string()).optional(),
    ingredient: vine.array(vine.string()).optional(),
    expiration_date: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    conservation_advice: vine.string().trim().optional(),
  })
)
