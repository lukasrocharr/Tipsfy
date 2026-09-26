import { Subscription, type SubscriptionStatus } from '../../domain/entities/Subscription'
import type { SubscriptionRepository } from '../../application/ports/SubscriptionRepository'
import { prisma } from './prisma'

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async salvar(subscription: Subscription): Promise<void> {
    await prisma.subscription.create({ data: { id: subscription.id, subscriberId: subscription.subscriberId, planId: subscription.planId, status: subscription.status, dueDate: subscription.dueDate } })
  }

  async buscarPorId(id: string): Promise<Subscription | null> {
    const record = await prisma.subscription.findUnique({ where: { id } })
    return record ? new Subscription(record.id, record.subscriberId, record.planId, record.status as SubscriptionStatus, record.dueDate) : null
  }

  async listarPorCanal(channelId: string): Promise<Subscription[]> {
    const records = await prisma.subscription.findMany({
      where: { plan: { channelId } },
      orderBy: { dueDate: 'asc' },
    })
    return records.map(record => new Subscription(record.id, record.subscriberId, record.planId, record.status as SubscriptionStatus, record.dueDate))
  }

  async atualizarStatus(id: string, status: SubscriptionStatus): Promise<void> {
    await prisma.subscription.update({ where: { id }, data: { status } })
  }

  async listarAtivasVencidas(agora: Date, toleranceDays: number): Promise<Subscription[]> {
    const cutoff = new Date(agora.getTime() - toleranceDays * 24 * 60 * 60 * 1000)
    const records = await prisma.subscription.findMany({
      where: { status: 'ACTIVE', dueDate: { lt: cutoff } },
      orderBy: { dueDate: 'asc' },
    })
    return records.map(record => new Subscription(record.id, record.subscriberId, record.planId, record.status as SubscriptionStatus, record.dueDate))
  }

  async listarAtivasProximasDoVencimento(agora: Date, daysAhead: number): Promise<Subscription[]> {
    const cutoff = new Date(agora.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const records = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: {
          gte: agora,
          lte: cutoff,
        },
      },
      orderBy: { dueDate: 'asc' },
    })
    return records.map(record => new Subscription(record.id, record.subscriberId, record.planId, record.status as SubscriptionStatus, record.dueDate))
  }

  async contarAtivosPorCanal(channelId: string): Promise<number> {
    return prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        plan: { channelId },
      },
    })
  }
}
