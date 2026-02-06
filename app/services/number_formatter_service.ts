export class NumberFormatterService {
  /**
   * Formate un nombre en format décimal avec séparateur de milliers et précision.
   * @param value Le nombre à formater.
   * @param decimals Le nombre de chiffres après la virgule.
   * @param locale La locale (ex: 'fr-FR').
   * @returns Le nombre formaté en chaîne de caractères.
   */
  public static formatDecimal(
    value: number,
    decimals: number = 2,
    locale: string = 'fr-FR'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }
}
