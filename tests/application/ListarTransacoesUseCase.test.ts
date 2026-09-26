import { describe, expect, it } from 'vitest'
import { ListarTransacoesUseCase } from '../../src/application/use-cases/financials/ListarTransacoesUseCase'
import type { PaymentRepository } from '../../src/application/ports/PaymentRepository'
import { Payment } from '../../src/domain/entities/Payment'

type PaymentRow = Awaited<ReturnType<PaymentRepository['buscarPorTipster']>>[number]

class PaymentRepositoryFake implements PaymentRepository {
  constructor(private readonly rows: PaymentRow[]) {}

  async salvar(): Promise<void> {}
  async buscarPorGatewayTxId(): Promise<Payment | null> { return null }
  async buscarPorId(): Promise<Payment | null> { return null }
  async buscarUltimoPorSubscriptionId(): Promise<Payment | null> { return null }
  async buscarPorTipster(): Promise<PaymentRow[]> { return this.rows }
  async atualizarResultado(): Promise<void> {}
}

describe('ListarTransacoesUseCase', () => {
  it('mapeia payments para transactions cobrindo paid, pending, failed e refunded', async () => {
    const repo = new PaymentRepositoryFake([
      {
        id: 'pay-1',
        subscriptionId: 'sub-1',
        amount: 39.9,
        method: 'pix',
        status: 'PAID',
        gatewayTxId: 'tx-1',
        createdAt: new Date('2026-09-15T10:00:00.000Z'),
        subscriberName: 'Carlos Mendes',
        telegram: '@carlosm',
        plan: 'VIP Mensal',
        description: 'Renovação setembro',
      },
      {
        id: 'pay-2',
        subscriptionId: 'sub-2',
        amount: 79.8,
        method: 'credit_card',
        status: 'PENDING',
        gatewayTxId: 'tx-2',
        createdAt: new Date('2026-09-18T11:00:00.000Z'),
        subscriberName: 'Ana Paula Silva',
        telegram: '@anapaula',
        plan: 'VIP Mensal',
        description: 'Cobrança pendente',
      },
      {
        id: 'pay-3',
        subscriptionId: 'sub-3',
        amount: 99.9,
        method: 'pix',
        status: 'FAILED',
        gatewayTxId: 'tx-3',
        createdAt: new Date('2026-09-01T12:00:00.000Z'),
        subscriberName: 'Bruno Ferreira',
        telegram: '@brunof',
        plan: 'Premium Trimestral',
        description: 'Falha no pagamento',
      },
      {
        id: 'pay-4',
        subscriptionId: 'sub-4',
        amount: 39.9,
        method: 'credit_card',
        status: 'REFUNDED',
        gatewayTxId: 'tx-4',
        createdAt: new Date('2026-08-10T09:00:00.000Z'),
        subscriberName: 'Fernanda Lima',
        telegram: '@fernandalima',
        plan: 'VIP Mensal',
        description: 'Reembolso processado',
      },
    ])

    const result = await new ListarTransacoesUseCase(repo).execute({ tipsterId: 'tipster-1' })

    expect(result).toEqual([
      {
        id: 'pay-1',
        subscriberName: 'Carlos Mendes',
        telegram: '@carlosm',
        plan: 'VIP Mensal',
        amount: 39.9,
        method: 'pix',
        status: 'paid',
        date: '2026-09-15',
        description: 'Renovação setembro',
      },
      {
        id: 'pay-2',
        subscriberName: 'Ana Paula Silva',
        telegram: '@anapaula',
        plan: 'VIP Mensal',
        amount: 79.8,
        method: 'credit_card',
        status: 'pending',
        date: '2026-09-18',
        description: 'Cobrança pendente',
      },
      {
        id: 'pay-3',
        subscriberName: 'Bruno Ferreira',
        telegram: '@brunof',
        plan: 'Premium Trimestral',
        amount: 99.9,
        method: 'pix',
        status: 'failed',
        date: '2026-09-01',
        description: 'Falha no pagamento',
      },
      {
        id: 'pay-4',
        subscriberName: 'Fernanda Lima',
        telegram: '@fernandalima',
        plan: 'VIP Mensal',
        amount: 39.9,
        method: 'credit_card',
        status: 'refunded',
        date: '2026-08-10',
        description: 'Reembolso processado',
      },
    ])
  })
})
