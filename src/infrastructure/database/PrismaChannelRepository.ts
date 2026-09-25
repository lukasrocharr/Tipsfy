import { Channel } from '../../domain/entities/Channel'
import type { ChannelRepository } from '../../application/ports/ChannelRepository'
import { prisma } from './prisma'

export class PrismaChannelRepository implements ChannelRepository {
  async salvar(channel: Channel): Promise<void> {
    await prisma.channel.create({ data: channel })
  }

  async buscarPorId(id: string): Promise<Channel | null> {
    const record = await prisma.channel.findUnique({ where: { id } })
    return record ? new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name) : null
  }

  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> {
    const records = await prisma.channel.findMany({ where: { tipsterId }, orderBy: { createdAt: 'asc' } })
    return records.map(record => new Channel(record.id, record.tipsterId, record.telegramChatId, record.botTokenEnc, record.name))
  }
}