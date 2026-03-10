import AdminInvitation from '#models/admin_invitation'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export class AdminService {
  public async sendEmail(email: string, permission: any) {
    await AdminInvitation.create({
      email: email,
      permission: permission,
      expireAt: DateTime.now().plus({ hour: 24 }),
    })

    const signedUrl = new URL(
      router.makeSignedUrl('admin.register', { email: email }, { expiresIn: '24h' }),
      process.env.APP_URL
    ).toString()

    console.log(signedUrl)
    await mail.send((message: any) => {
      message
        .to(email)
        .subject('création de compte administrateur')
        .htmlView('mail/admin-invitation', { email: email, signedUrl: signedUrl })
    })
  }
}
