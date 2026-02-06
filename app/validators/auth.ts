import vine from '@vinejs/vine'

export const AuthValidator = vine.compile(
  vine.object({
    forward: vine.string().optional(),
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
  })
)
