import { Notification } from '../../../domain/entities/Notification'

export type NotificationPayload = {
  id?: string
  tipsterId: string
  type?: 'payment' | 'subscriber' | 'system' | 'alert'
  title: string
  message: string
  read?: boolean
  createdAt?: Date | string
}

export class GerarNotificacoesUseCase {
  execute(input: { tipsterId: string; payments?: Array<{ status?: string; amount?: number; createdAt?: Date | string; subscriptionId?: string }>; auditLogs?: Array<{ action?: string; details?: string; createdAt?: Date | string }>; limit?: number }): Notification[] {
    const notifications: Notification[] = []
    const limit = input.limit ?? 5

    for (const payment of input.payments ?? []) {
      if (payment.status !== 'PAID') continue
      notifications.push(new Notification(
        payment.subscriptionId ? `payment-${payment.subscriptionId}` : `payment-${Date.now()}-${notifications.length}`,
        input.tipsterId,
        'payment',
        'Pagamento recebido',
        `Cobrança confirmada no valor de R$ ${Number(payment.amount ?? 0).toFixed(2).replace('.', ',')}.`,
        false,
        payment.createdAt ? new Date(payment.createdAt) : new Date(),
      ))
    }

    for (const log of input.auditLogs ?? []) {
      if (!log.action?.includes('overdue') && !log.action?.includes('review')) continue
      notifications.push(new Notification(
        log.action ? `audit-${log.action}` : `audit-${Date.now()}-${notifications.length}`,
        input.tipsterId,
        'alert',
        'Atenção de cobrança',
        log.details ?? 'Há uma pendência de cobrança para revisar.',
        false,
        log.createdAt ? new Date(log.createdAt) : new Date(),
      ))
    }

    return notifications.slice(0, limit)
  }
}
