import { AuditLog } from '../../../domain/entities/AuditLog'
import type { AuditLogRepository } from '../../ports/AuditLogRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'

export class CancelarAssinaturaUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly removerAcessoUseCase: { execute(subscription: { id: string; subscriberId: string; planId: string; status: string; dueDate: Date }): Promise<void> },
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.buscarPorId(subscriptionId)
    if (!subscription) return

    await this.removerAcessoUseCase.execute(subscription)
    await this.subscriptionRepository.atualizarStatus(subscription.id, 'CANCELLED')
    await this.auditLogRepository.salvar(new AuditLog(
      subscription.id,
      'subscription.cancelled',
      `Assinatura cancelada manualmente. Acesso removido e status atualizado para CANCELLED.`,
    ))
  }
}
