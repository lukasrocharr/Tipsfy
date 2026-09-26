/**
 * Porta de persistência das cobranças e da chave de idempotência do gateway.
 */
import type { Payment, PaymentStatus } from '../../domain/entities/Payment'

export type PaymentTransactionRow = {
  id: string
  subscriptionId: string
  amount: number
  method: 'pix' | 'credit_card'
  status: PaymentStatus | 'REFUNDED'
  gatewayTxId: string | null
  createdAt: Date
  subscriberName: string
  telegram: string | null
  plan: string
  description?: string
}

export interface PaymentRepository {
  salvar(payment: Payment): Promise<void>
  buscarPorGatewayTxId(gatewayTxId: string): Promise<Payment | null>
  buscarPorId(id: string): Promise<Payment | null>
  buscarUltimoPorSubscriptionId(subscriptionId: string): Promise<Payment | null>
  buscarPorTipster(tipsterId: string): Promise<PaymentTransactionRow[]>
  atualizarResultado(id: string, status: PaymentStatus, gatewayTxId: string): Promise<void>
}
