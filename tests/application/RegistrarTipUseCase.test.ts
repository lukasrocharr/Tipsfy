import { describe, expect, it } from 'vitest'
import type { ChannelRepository } from '../../src/application/ports/ChannelRepository'
import type { TipRepository } from '../../src/application/ports/TipRepository'
import type { TipsterRepository } from '../../src/application/ports/TipsterRepository'
import { RegistrarTipUseCase } from '../../src/application/use-cases/tips/RegistrarTipUseCase'
import { Channel } from '../../src/domain/entities/Channel'
import { Tip } from '../../src/domain/entities/Tip'
import { Tipster } from '../../src/domain/entities/Tipster'
import { RecursoNaoDisponivelNoPlanoError } from '../../src/domain/errors/RecursoNaoDisponivelNoPlanoError'

class TipRepositoryFake implements TipRepository {
  private readonly map = new Map<string, Tip>()
  async salvar(tip: Tip): Promise<void> { this.map.set(tip.id, tip) }
  async atualizar(tip: Tip): Promise<void> { this.map.set(tip.id, tip) }
  async buscarPorId(id: string): Promise<Tip | null> { return this.map.get(id) ?? null }
  async listarPorCanal(): Promise<Tip[]> { return [] }
  async remover(): Promise<void> {}
  async atualizarResultado(): Promise<void> {}
}

class ChannelRepositoryFake implements ChannelRepository {
  channels: Channel[] = [
    new Channel('channel-1', 'tipster-1', '@canal1', 'enc:token1', 'Meu Canal'),
    new Channel('channel-2', 'tipster-1', '@canal2', 'enc:token2', 'Segundo Canal'),
  ]
  async salvar(): Promise<void> {}
  async buscarPorId(id: string): Promise<Channel | null> { return this.channels.find(channel => channel.id === id) ?? null }
  async buscarPorPublicSlug(): Promise<Channel | null> { return null }
  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> { return this.channels.filter(channel => channel.tipsterId === tipsterId) }
  async atualizarBotToken(): Promise<void> {}
}

class TipsterRepositoryFake implements TipsterRepository {
  tipster = new Tipster('tipster-1', 'rafael@tipsfy.io', 'hash', 'STARTER', new Date(Date.now() + 1000 * 60 * 60 * 24))
  async salvar(): Promise<void> {}
  async buscarPorId(): Promise<Tipster | null> { return this.tipster }
  async buscarPorEmail(): Promise<Tipster | null> { return this.tipster }
  async existeEmail(): Promise<boolean> { return true }
}

describe('RegistrarTipUseCase', () => {
  it('rejeita broadcast para mais de um canal no plano Starter', async () => {
    const repository = new TipRepositoryFake()
    const channelRepository = new ChannelRepositoryFake()
    const tipsterRepository = new TipsterRepositoryFake()
    const useCase = new RegistrarTipUseCase(repository, channelRepository, tipsterRepository)

    await expect(useCase.execute({
      channelId: 'channel-1',
      sport: 'Futebol',
      event: 'Flamengo x Palmeiras',
      market: 'Ambas Marcam',
      odds: 2.5,
      units: 1.5,
      broadcastToChannelIds: ['channel-2'],
    })).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
  })
})
