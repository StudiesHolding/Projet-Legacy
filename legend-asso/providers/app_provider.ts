import type { ApplicationService } from '@adonisjs/core/types'
import edge from 'edge.js'
import string from '@adonisjs/core/helpers/string'
declare const Intl: { NumberFormat: typeof NumberFormat }

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {
    edge.global(
      'formatNumber',
      (
        value: number | string,
        // La locale 'fr-FR' garantit que l'espace est utilisé comme séparateur de milliers
        locale: string = 'fr-FR',
        options?: Intl.NumberFormatOptions
      ) => {
        const numberValue = Number(value)
        // Sécurité : Vérifier si la valeur est un nombre valide
        if (Number.isNaN(numberValue)) {
          return String(value)
        }

        // Configuration par défaut : style décimal pour la séparation des milliers
        const defaultOptions: Intl.NumberFormatOptions = {
          style: 'decimal',
          minimumFractionDigits: 0, // Optionnel : ne pas forcer de décimales
          maximumFractionDigits: 2, // Optionnel : limiter à 2 décimales
          ...options, // Permet d'écraser les options par défaut (ex: ajouter style: 'currency')
        }

        return new Intl.NumberFormat(locale, defaultOptions).format(numberValue)
      }
    )

    edge.global('string', string)
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
