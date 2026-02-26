import vine from '@vinejs/vine'

export const stepTwoValidator = vine.compile(
  vine.object({
    location: vine.string(),
    is_member: vine.boolean(),
    member_code: vine.string(),
  })
)
