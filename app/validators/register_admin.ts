import vine from '@vinejs/vine'

export const registerAdminValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
    username: vine.string().minLength(4),
  })
)
