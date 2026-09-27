/**
 * Caso de uso de criação de canal Telegram.
 * Starter possui limite comercial de um canal; Pro não sofre esse limite nesta etapa.
 */
import { randomUUID } from 'node:crypto'
import { Channel } from '../../../domain/entities/Channel'
import { LimiteDeCanaisExcedidoError } from '../../../domain/errors/LimiteDeCanaisExcedidoError'
import { generateUniquePublicChannelSlug } from '../../../domain/services/publicChannelSlug.mjs'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { TipsterRepository } from '../../ports/TipsterRepository'

export type CriarCanalInput = { tipsterId: string; telegramChatId: string; botTokenEnc: string | null; name: string }

export class CriarCanalUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly tipsterRepository: TipsterRepository,
  ) {}

  async execute(input: CriarCanalInput): Promise<Channel> {
    const tipster = await this.tipsterRepository.buscarPorId(input.tipsterId)
    if (!tipster) throw new Error('Tipster não encontrado.')
    const channels = await this.channelRepository.listarPorTipsterId(input.tipsterId)
    if (tipster.planTier === 'STARTER' && channels.length >= 1) {
      throw new LimiteDeCanaisExcedidoError()
    }
    const publicSlug = await generateUniquePublicChannelSlug(
      input.name,
      async (slug) => Boolean(await this.channelRepository.buscarPorPublicSlug(slug)),
    )

    const channel = new Channel(
      randomUUID(),
      input.tipsterId,
      input.telegramChatId,
      input.botTokenEnc,
      input.name,
      publicSlug,
    )
    await this.channelRepository.salvar(channel)
    return channel
  }
}
