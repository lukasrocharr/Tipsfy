import { Payment, type PaymentStatus } from '../../domain/entities/Payment'
import type { PaymentRepository, PaymentTransactionRow } from '../../application/ports/PaymentRepository'
import { prisma } from './prisma'

export class PrismaPaymentRepository implements PaymentRepository {
  async salvar(payment: Payment): Promise<void> {
    await prisma.payment.create({ data: { id: payment.id, subscriptionId: payment.subscriptionId, amount: payment.amount, method: payment.method, status: payment.status } })
  }

  async buscarPorGatewayTxId(gatewayTxId: string): Promise<Payment | null> {
    const record = await prisma.payment.findUnique({ where: { gatewayTxId } })
    return record ? this.toDomain(record) : null
  }

  async buscarPorId(id: string): Promise<Payment | null> {
    const record = await prisma.payment.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async buscarUltimoPorSubscriptionId(subscriptionId: string): Promise<Payment | null> {
    const record = await prisma.payment.findFirst({ where: { subscriptionId }, orderBy: { createdAt: 'desc' } })
    return record ? this.toDomain(record) : null
  }

  async buscarPorTipster(tipsterId: string): Promise<PaymentTransactionRow[]> {
    const rows = await prisma.payment.findMany({
      where: {
        subscription: {
          plan: {
            channel: { tipsterId },
          },
        },
      },
      include: {
        subscription: {
          include: {
            subscriber: true,
            plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return rows.map(row => ({
      id: row.id,
      subscriptionId: row.subscriptionId,
      amount: Number(row.amount),
      method: row.method as 'pix' | 'credit_card',
      status: row.status as PaymentStatus | 'REFUNDED',
      gatewayTxId: row.gatewayTxId,
      createdAt: row.createdAt,
      subscriberName: row.subscription.subscriber.name,
      telegram: row.subscription.subscriber.telegram,
      plan: row.subscription.plan.name,
      description: `Pagamento ${row.status.toLowerCase()}`,
    }))
  }

  async atualizarResultado(id: string, status: PaymentStatus, gatewayTxId: string): Promise<void> {
    await prisma.payment.update({ where: { id }, data: { status, gatewayTxId } })
  }

  private toDomain(record: { id: string; subscriptionId: string; amount: { toNumber(): number }; method: string; status: string; gatewayTxId: string | null; pixQrCode: string | null; checkoutUrl: string | null }): Payment {
    return new Payment(record.id, record.subscriptionId, record.amount.toNumber(), record.method as Payment['method'], record.status as PaymentStatus, record.gatewayTxId, record.pixQrCode, record.checkoutUrl)
  }
}
