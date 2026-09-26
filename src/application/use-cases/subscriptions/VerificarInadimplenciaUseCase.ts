/**
 * Verifica assinaturas ativas e vencidas para bloquear acesso e registrar o motivo.
 * A checagem de tolerância acontece antes de chamar qualquer gateway ou Telegram,
 * porque qualquer dívida dentro do prazo não deve gastar API externa nem disparar ação.
 */
import type { AuditLogRepository } from '../../ports/AuditLogRepository'
import type { PaymentGateway } from '../../ports/PaymentGateway'
import type { PaymentRepository } from '../../ports/PaymentRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import { AuditLog } from '../../../domain/entities/AuditLog'
import type { Subscription } from '../../../domain/entities/Subscription'

export class VerificarInadimplenciaUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly removerAcessoUseCase: { execute(subscription: Subscription): Promise<void> },
    private readonly auditLogRepository: AuditLogRepository,
    private readonly toleranceDays: number = 3,
  ) {}

  async execute(agora: Date = new Date()): Promise<void> {
    const subscriptions = await this.subscriptionRepository.listarAtivasVencidas?.(agora, this.toleranceDays) ?? []

    for (const subscription of subscriptions) {
      const payment = await this.paymentRepository.buscarUltimoPorSubscriptionId?.(subscription.id) ?? null
      const reason = payment && payment.status === 'PAID' ? 'pagamento recente confirmado fora do prazo' : 'assinatura vencida além da tolerância'

      try {
        if (!this.paymentGateway || !('criarCobrancaPix' in this.paymentGateway)) {
          throw new Error('Gateway indisponível')
        }

        await this.paymentGateway.criarCobrancaPix({
          paymentId: payment?.id ?? subscription.id,
          amount: payment?.amount ?? 0,
          email: 'unknown@example.com',
          description: 'Recorrência Tipsfy',
          method: 'pix',
        })
      } catch {
        await this.removerAcessoUseCase.execute(subscription)
        await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.overdue', `Assinatura vencida: ${reason}; tolerância expirada; acesso removido por falha ao tentar nova cobrança.`))
        continue
      }

      await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.review', `Assinatura vencida; ${reason}; cobrança nova tentada e não exigiu remoção de acesso.`))
    }
  }
}
