import OtpVerification from '#models/otp_verification'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

export default class AuthService {
  /**
   * Génère et envoie un OTP
   */
  public async sendOtp(data: any) {
    const email = data.email
    if (!email) {
      console.error("Erreur AuthService: L'objet data ne contient pas d'email", data)
      throw new Error("Impossible d'envoyer l'OTP : destinataire manquant.")
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Enregistrement en base de données
    console.log('Voici mon email pour essayer', email)
    await OtpVerification.create({
      email: email,
      otpValue: otpCode,
      expireAt: DateTime.now().plus({ minutes: 10 }),
    })

    // 3. Envoi du mail
    console.log('Voici mon email pour essayer', email)
    await mail.send((message) => {
      message
        .to(email)
        .from('legaci@legends.dev')
        .subject('Vérification de votre compte')
        .htmlView('mail/email-verification', { data, otpCode })
    })
  }

  public async verifyOtp(email: string, otp: string) {
    const otpRecord = await OtpVerification.query()
      .where('otpValue', otp)
      .where('email', email)
      .where('status', 'unuse')
      .where('expireAt', '>', DateTime.now().toSQL())
      .first()
    if (!otpRecord) {
      console.log('Code invalide ou expiré')
      return false
    } else {
      return true
    }
  }

  public async handleStepOne() {
    console.log('yoyo')
  }

  /**
   * Logique de redirection après login
   */
  public async getTargetUrl(user: any, intendedUrl?: string | null) {
    if (intendedUrl?.includes('checkout')) {
      return '/payment'
    }
    console.log(user)
    if (intendedUrl) return intendedUrl

    return user.role === 'seller' ? '/dashboard-seller' : '/dashboard-client'
  }
}
