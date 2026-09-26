/**
 * Caso de uso de desconexão do bot.
 * Limpar o segredo cifrado revoga a capacidade da aplicação de operar aquele canal.
 */
import type { ChannelRepository } from '../../ports/ChannelRepository'

export class DesconectarBotUseCase {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async execute(channelId: string): Promise<void> {
    if (!await this.channelRepository.buscarPorId(channelId)) throw new Error('Canal não encontrado.')
    await this.channelRepository.atualizarBotToken(channelId, null)
  }
}
