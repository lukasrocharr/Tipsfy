import type { Transaction } from '../../../interfaces/web/data'
import type { PaymentRepository } from '../../ports/PaymentRepository'

export type TransactionStatusFilter = 'all' | 'paid' | 'pending' | 'failed' | 'refunded'

export class ListarTransacoesUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: { tipsterId: string; status?: TransactionStatusFilter }): Promise<Transaction[]> {
    const status = input.status ?? 'all'
    const rows = await this.paymentRepository.buscarPorTipster(input.tipsterId)
    const transactions = rows.map(row => ({
      id: row.id,
      subscriberName: row.subscriberName,
      telegram: row.telegram ?? '@sem-telegram',
      plan: row.plan,
      amount: Number(row.amount),
      method: row.method,
      status: this.toTransactionStatus(row.status),
      date: this.toDate(row.createdAt),
      description: row.description ?? 'Pagamento de assinatura',
    }))

    return status === 'all' ? transactions : transactions.filter(transaction => transaction.status === status)
  }

  private toTransactionStatus(status: string): Transaction['status'] {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'paid'
      case 'PENDING':
        return 'pending'
      case 'FAILED':
        return 'failed'
      case 'REFUNDED':
      case 'REFUND':
        return 'refunded'
      default:
        return 'pending'
    }
  }

  private toDate(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE').format(date)
  }
}
