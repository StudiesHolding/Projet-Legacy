import DelivryPriceRule from '#models/delivry_price_rule'
export class CartService {
  static async getDeliveryCost(city: string, weight: number): Promise<number> {
    const rule = await DelivryPriceRule.query()
      .where('city', city)
      .where('min_weight', '<=', weight)
      .where('max_weight', '>=', weight)
      .first()
    if (!rule) {
      console.error(`Aucun tariff trouvé pour ${city} et ${weight} kg`)
      return 0
    }
    return rule.price
  }
}
