/**
 * Entidade central da conta do tipster e do período inicial de experimentação.
 * Ela não conhece Prisma nem NextAuth para manter o domínio independente de persistência,
 * transporte HTTP e detalhes do framework de autenticação.
 */
export type PlanTier = 'STARTER' | 'PRO'

export type TipsterPublic = Omit<Tipster, 'passwordHash' | 'withoutPassword'>

export class Tipster {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly planTier: PlanTier,
    public readonly trialEndsAt: Date,
  ) {}

  withoutPassword(): TipsterPublic {
    const { passwordHash: _passwordHash, ...publicTipster } = this
    return publicTipster
  }
}