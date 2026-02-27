import vine from '@vinejs/vine'

export const DelivryPriceRuleValidator = vine.compile(
  vine.object({
    city: vine.string(),
    minWeight: vine.string(),
    maxWeight: vine.string(),
    price: vine.string(),
  })
)
