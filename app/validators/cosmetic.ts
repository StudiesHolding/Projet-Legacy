import vine from '@vinejs/vine'

export const CosmeticValidator = vine.compile(
  vine.object({
    precautions: vine.string().trim().optional(),
    skinType: vine.string().trim().optional(),
    texture: vine.string().trim().optional(),
    capacity_value: vine.number().positive().min(0.01),
    capacity_unit: vine.enum(['ml', 'l', 'g', 'kg']),
    ingredients: vine.array(vine.string().trim()).compact().optional(),
  })
)
