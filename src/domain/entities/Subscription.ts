/**
 * Entidade que liga um assinante a um plano e controla o próximo vencimento.
 * O dueDate é calculado pelo caso de uso com o Value Object Periodicity.
 */
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'CANCELLED' | 'PAST_DUE'

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly subscriberId: string,
    public readonly planId: string,
    public readonly status: SubscriptionStatus,
    public readonly dueDate: Date,
  ) {}
}