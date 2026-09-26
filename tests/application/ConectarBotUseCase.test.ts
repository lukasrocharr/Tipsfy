import { describe, expect, it } from 'vitest'
import { ConectarBotUseCase } from '../../src/application/use-cases/channels/ConectarBotUseCase'
import type { ChannelRepository } from '../../src/application/ports/ChannelRepository'
import type { TelegramClient } from '../../src/application/ports/TelegramClient'
import type { CriptografiaService } from '../../src/application/ports/CriptografiaService'
import { Channel } from '../../src/domain/entities/Channel'
import { BotSemPermissaoDeAdminError } from '../../src/domain/errors/BotSemPermissaoDeAdminError'

class ChannelRepositoryFake implements ChannelRepository {
  channel = new Channel('channel-1', 'tipster-1', '@canal', null, 'Canal')

  async salvar(channel: Channel): Promise<void> { this.channel = channel }
  async buscarPorId(): Promise<Channel> { return this.channel }
  async listarPorTipsterId(): Promise<Channel[]> { return [this.channel] }
  async atualizarBotToken(_id: string, botTokenEnc: string | null): Promise<void> {
    this.channel = new Channel(this.channel.id, this.channel.tipsterId, this.channel.telegramChatId, botTokenEnc, this.channel.name)
  }
}

class TelegramClientFake implements TelegramClient {
  async validarAcessoDoBot(): Promise<void> { throw new BotSemPermissaoDeAdminError() }
  async criarConviteDeUsoUnico(): Promise<string> { return '' }
  async removerMembro(): Promise<void> {}
  async enviarMensagemAoCanal(): Promise<void> {}
}

class CriptografiaFake implements CriptografiaService {
  criptografar(value: string): string { return `encrypted:${value}` }
  descriptografar(value: string): string { return value.replace('encrypted:', '') }
}

describe('ConectarBotUseCase', () => {
  it('retorna erro específico quando o bot não é administrador', async () => {
    const repository = new ChannelRepositoryFake()
    const useCase = new ConectarBotUseCase(repository, new TelegramClientFake(), new CriptografiaFake())
    const token = `123456789:${'a'.repeat(35)}`

    await expect(useCase.execute({ channelId: 'channel-1', token, chatId: '@canal' }))
      .rejects.toBeInstanceOf(BotSemPermissaoDeAdminError)
    expect(repository.channel.botTokenEnc).toBeNull()
  })
})
