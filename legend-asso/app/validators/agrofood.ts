import vine from '@vinejs/vine'

export const AgrofoodValidator = vine.compile(
  vine.object({
    certification: vine.array(vine.string()).optional().nullable(),
    ingredient: vine.array(vine.string().nullable()).compact().optional().nullable(),
    expiration_date: vine
      .date({ formats: ['YYYY-MM-DD'] })
      .optional()
      .nullable(),
    conservation_advice: vine.string().trim().optional().nullable(),
  })
)
