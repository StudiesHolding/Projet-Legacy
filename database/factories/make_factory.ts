import factory from '@adonisjs/lucid/factories'
import Make from '#models/make'

export const MakeFactory = factory
  .define(Make, async ({ faker }) => {
    return {}
  })
  .build()