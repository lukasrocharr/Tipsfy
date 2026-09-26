/**
 * Caso de uso idempotente de confirmação de pagamento via webhook.
 * Gateways reenviam o mesmo webhook quando a resposta demora; gatewayTxId impede
 * que a assinatura seja ativada ou os efeitos futuros sejam executados duas vezes.
 */
import { PagamentoNaoEncontradoError } from '../../../domain/errors/PagamentoNaoEncontradoError'
import { WebhookJaProcessadoError } from '../../../domain/errors/WebhookJaProcessadoError'
import type { PaymentRepository } from '../../ports/PaymentRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import type { LiberarAcessoAoCanalUseCase } from '../subscriptions/LiberarAcessoAoCanalUseCase'

export class ConfirmarPagamentoUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly liberarAcessoAoCanalUseCase?: LiberarAcessoAoCanalUseCase,
  ) {}

  async execute(input: { gatewayTxId: string; status: 'PAID' | 'FAILED' }): Promise<void> {
    const payment = await this.paymentRepository.buscarPorGatewayTxId(input.gatewayTxId)
    if (!payment) throw new PagamentoNaoEncontradoError()
    if (payment.status !== 'PENDING') throw new WebhookJaProcessadoError()
    await this.paymentRepository.atualizarResultado(payment.id, input.status, input.gatewayTxId)
    if (input.status === 'PAID') {
      await this.subscriptionRepository.atualizarStatus(payment.subscriptionId, 'ACTIVE')
      // HU2 exige que a liberação do canal aconteça em até 2 minutos, por isso esta etapa
      // roda de forma síncrona no próprio webhook e não fica em fila assíncrona.
      await this.liberarAcessoAoCanalUseCase?.execute(payment.subscriptionId)
      return
    }
    await this.subscriptionRepository.atualizarStatus(payment.subscriptionId, 'FAILED')
  }
}
