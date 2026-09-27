import { Channel } from '../../domain/entities/Channel'
import type { ChannelRepository } from '../../application/ports/ChannelRepository'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export class PrismaChannelRepository implements ChannelRepository {
  constructor(
    private readonly database: Prisma.TransactionClient = prisma,
  ) {}

  async salvar(channel: Channel): Promise<void> {
    await this.database.channel.create({ data: {
      id: channel.id,
      tipsterId: channel.tipsterId,
      telegramChatId: channel.telegramChatId,
      botTokenEnc: channel.botTokenEnc,
      name: channel.name,
      publicSlug: channel.publicSlug ?? null,
    } })
  }

  async atualizarBotToken(id: string, botTokenEnc: string | null): Promise<void> {
    await this.database.channel.update({ where: { id }, data: { botTokenEnc } })
  }

  async atualizarPublicSlug(id: string, publicSlug: string): Promise<void> {
    await this.database.channel.update({ where: { id }, data: { publicSlug } })
  }

  async buscarPorId(id: string): Promise<Channel | null> {
    const record = await this.database.channel.findUnique({ where: { id } })
    return record ? new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug) : null
  }

  async buscarPorPublicSlug(publicSlug: string): Promise<Channel | null> {
    const record = await this.database.channel.findUnique({ where: { publicSlug } })
    return record ? new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug) : null
  }

  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> {
    const records = await this.database.channel.findMany({ where: { tipsterId }, orderBy: { createdAt: 'asc' } })
    return records.map(record => new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug))
  }
}