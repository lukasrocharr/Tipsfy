/**
 * Caso de uso de conexão do bot ao canal do tipster.
 * Primeiro valida acesso e permissão no Telegram; só depois cifra e persiste o token.
 */
import { TokenInvalidoError } from '../../../domain/errors/TokenInvalidoError'
import { TokenDeBot } from '../../../domain/value-objects/TokenDeBot'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { CriptografiaService } from '../../ports/CriptografiaService'
import type { TelegramClient } from '../../ports/TelegramClient'

export type ConectarBotInput = { channelId: string; token: string; chatId: string }

export class ConectarBotUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly telegramClient: TelegramClient,
    private readonly criptografiaService: CriptografiaService,
  ) {}

  async execute({ channelId, token, chatId }: ConectarBotInput): Promise<void> {
    const channel = await this.channelRepository.buscarPorId(channelId)
    if (!channel || channel.telegramChatId !== chatId) throw new Error('Canal não encontrado.')
    let validToken: TokenDeBot
    try {
      validToken = TokenDeBot.criar(token)
    } catch {
      throw new TokenInvalidoError()
    }
    await this.telegramClient.validarAcessoDoBot(validToken.value, chatId)
    const webhookUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/webhooks/telegram/${channelId}`
    await this.telegramClient.registrarWebhook(validToken.value, webhookUrl)
    await this.channelRepository.atualizarBotToken(channelId, this.criptografiaService.criptografar(validToken.value))
  }
}
