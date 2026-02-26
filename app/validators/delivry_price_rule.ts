import vine from '@vinejs/vine'

export const DelivryPriceRuleValidator = vine.compile(
  vine.object({
    city: vine.string(),
    minWeight: vine.number(),
    maxWeight: vine.number(),
    price: vine.number(),
  })
)
