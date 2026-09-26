import { Subscriber } from '../../domain/entities/Subscriber'
import type { SubscriberRepository } from '../../application/ports/SubscriberRepository'
import { prisma } from './prisma'

export class PrismaSubscriberRepository implements SubscriberRepository {
  async buscarPorEmail(email: string, channelId: string): Promise<Subscriber | null> {
    const record = await prisma.subscriber.findUnique({ where: { channelId_email: { channelId, email } } })
    return record ? new Subscriber(record.id, record.name, record.telegram, record.telegramId, record.email, record.channelId, [], record.pendingLinkToken) : null
  }

  async buscarPorId(id: string): Promise<Subscriber | null> {
    const record = await prisma.subscriber.findUnique({ where: { id } })
    return record ? new Subscriber(record.id, record.name, record.telegram, record.telegramId, record.email, record.channelId, [], record.pendingLinkToken) : null
  }

  async buscarPorLinkToken(linkToken: string): Promise<Subscriber | null> {
    const record = await prisma.subscriber.findFirst({ where: { pendingLinkToken: linkToken } })
    return record ? new Subscriber(record.id, record.name, record.telegram, record.telegramId, record.email, record.channelId, [], record.pendingLinkToken) : null
  }

  async listarPorCanal(channelId: string): Promise<Subscriber[]> {
    const records = await prisma.subscriber.findMany({ where: { channelId }, orderBy: { createdAt: 'desc' } })
    return records.map(record => new Subscriber(record.id, record.name, record.telegram, record.telegramId, record.email, record.channelId, [], record.pendingLinkToken))
  }

  async salvar(subscriber: Subscriber): Promise<void> {
    await prisma.subscriber.create({ data: { id: subscriber.id, channelId: subscriber.channelId, name: subscriber.name, telegram: subscriber.telegram, telegramId: subscriber.telegramId, email: subscriber.email, pendingLinkToken: subscriber.pendingLinkToken } })
  }

  async atualizarVinculo(id: string, dados: { telegram?: string | null; telegramId?: string | null; pendingLinkToken?: string | null }): Promise<void> {
    await prisma.subscriber.update({ where: { id }, data: dados })
  }
}
