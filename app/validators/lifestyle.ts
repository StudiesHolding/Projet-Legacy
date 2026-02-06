import vine from '@vinejs/vine'

export const LifestyleValidator = vine.compile(
  vine.object({
    craftsmanship: vine.array(vine.string()).optional(),
    style: vine.string().trim().optional(),
    usage: vine.string().trim().optional(),
    sizes: vine.array(vine.string()).optional(),
    length: vine.number().positive().optional().nullable(),
    width: vine.number().positive().optional().nullable(),
    height: vine.number().positive().optional().nullable(),
    weight: vine.number().positive().optional().nullable(),
    materials: vine.array(vine.string().trim().nullable()).compact().optional(),
    variants: vine.array(vine.string().trim().nullable()).compact().optional(),
  })
)
