import { Notification } from '../../domain/entities/Notification'
import type { NotificationRepository } from '../../application/ports/NotificationRepository'
import { prisma } from './prisma'

export class PrismaNotificationRepository implements NotificationRepository {
  async listarPorTipsterId(tipsterId: string): Promise<Notification[]> {
    const channels = await prisma.channel.findMany({ where: { tipsterId }, select: { id: true } })
    const channelIds = channels.map(channel => channel.id)
    const plans = await prisma.plan.findMany({ where: { channelId: { in: channelIds } }, select: { id: true } })
    const planIds = plans.map(plan => plan.id)

    const subscriptions = await prisma.subscription.findMany({
      where: { planId: { in: planIds } },
      include: { payments: true },
      orderBy: { dueDate: 'asc' },
    })

    const auditLogs = await prisma.auditLog.findMany({
      where: { subscriptionId: { in: subscriptions.map(subscription => subscription.id) } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const notifications: Notification[] = []

    for (const subscription of subscriptions) {
      for (const payment of subscription.payments) {
        if (payment.status !== 'PAID') continue
        notifications.push(new Notification(
          `payment-${payment.id}`,
          tipsterId,
          'payment',
          'Pagamento recebido',
          `Cobrança confirmada no valor de R$ ${Number(payment.amount).toFixed(2).replace('.', ',')}.`,
          false,
          payment.createdAt,
        ))
      }
    }

    for (const log of auditLogs) {
      if (!log.action.includes('overdue') && !log.action.includes('review')) continue
      notifications.push(new Notification(
        `audit-${log.id}`,
        tipsterId,
        'alert',
        'Atenção de cobrança',
        log.details,
        false,
        log.createdAt,
      ))
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)
  }

  async marcarComoLida(id: string): Promise<void> {
    void id
  }
}
