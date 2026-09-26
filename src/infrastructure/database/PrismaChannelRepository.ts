import { Channel } from '../../domain/entities/Channel'
import type { ChannelRepository } from '../../application/ports/ChannelRepository'
import { prisma } from './prisma'

export class PrismaChannelRepository implements ChannelRepository {
  async salvar(channel: Channel): Promise<void> {
    await prisma.channel.create({ data: {
      id: channel.id,
      tipsterId: channel.tipsterId,
      telegramChatId: channel.telegramChatId,
      botTokenEnc: channel.botTokenEnc,
      name: channel.name,
      publicSlug: channel.publicSlug ?? null,
    } })
  }

  async atualizarBotToken(id: string, botTokenEnc: string | null): Promise<void> {
    await prisma.channel.update({ where: { id }, data: { botTokenEnc } })
  }

  async buscarPorId(id: string): Promise<Channel | null> {
    const record = await prisma.channel.findUnique({ where: { id } })
    return record ? new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug) : null
  }

  async buscarPorPublicSlug(publicSlug: string): Promise<Channel | null> {
    const record = await prisma.channel.findUnique({ where: { publicSlug } })
    return record ? new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug) : null
  }

  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> {
    const records = await prisma.channel.findMany({ where: { tipsterId }, orderBy: { createdAt: 'asc' } })
    return records.map(record => new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name, record.publicSlug))
  }
}