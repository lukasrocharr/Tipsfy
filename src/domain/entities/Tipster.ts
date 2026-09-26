/**
 * Entidade central da conta do tipster e do período inicial de experimentação.
 * Ela não conhece Prisma nem NextAuth para manter o domínio independente de persistência,
 * transporte HTTP e detalhes do framework de autenticação.
 */
export type PlanTier = 'STARTER' | 'PRO'

export type NotificationPreferences = {
  newSubscriber: boolean
  payment: boolean
  delinquent: boolean
  tips: boolean
  weekly: boolean
}

export type BankDetails = {
  pixType?: string
  pixKey?: string
  bank?: string
  agency?: string
  account?: string
  accountType?: string
  ownerDocument?: string
}

export type TipsterPublic = Omit<Tipster, 'passwordHash' | 'withoutPassword'>

export class Tipster {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly planTier: PlanTier,
    public readonly trialEndsAt: Date,
    public readonly name: string = '',
    public readonly bio: string = '',
    public readonly website: string = '',
    public readonly notificationPreferences: NotificationPreferences = {
      newSubscriber: true,
      payment: true,
      delinquent: true,
      tips: false,
      weekly: true,
    },
    public readonly bankDetails: BankDetails | null = null,
    public readonly deletedAt: Date | null = null,
    public readonly deletionReason: string | null = null,
  ) {}

  withoutPassword(): TipsterPublic {
    const { passwordHash: _passwordHash, ...publicTipster } = this
    return publicTipster
  }
}