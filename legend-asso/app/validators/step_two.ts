import vine from '@vinejs/vine'


export const stepTwoValidator = vine.compile(
    vine.object({
        sector:vine.string(),
        location:vine.string(),
        is_member:vine.string(),
        member_code:vine.string(),
    })
)