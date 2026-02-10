import vine from '@vinejs/vine'
const allowedRoles = ['admin', 'client', 'seller'] as const

export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    name: vine.string().optional(),
    password: vine.string().trim().minLength(8).confirmed(),
    role: vine.enum(allowedRoles).optional(),
  })
)
