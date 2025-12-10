import vine from '@vinejs/vine'
const allowedRoles = ['admin', 'client', 'seller'] as const

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    name: vine.string().optional(),
    phone: vine.string().mobile(),
    password: vine.string().trim().minLength(8).confirmed(),
    role: vine.enum(allowedRoles).optional(),
  })
)
