import { describe, expect, it } from 'vitest'
import type { ChannelRepository } from '../../src/application/ports/ChannelRepository'
import type { TipsterRepository } from '../../src/application/ports/TipsterRepository'
import { CriarCanalUseCase } from '../../src/application/use-cases/channels/CriarCanalUseCase'
import { Channel } from '../../src/domain/entities/Channel'
import { Tipster } from '../../src/domain/entities/Tipster'

class ChannelRepositoryFake implements ChannelRepository {
  readonly channels: Channel[] = []

  async salvar(channel: Channel): Promise<void> {
    this.channels.push(channel)
  }

  async buscarPorId(id: string): Promise<Channel | null> {
    return this.channels.find((channel) => channel.id === id) ?? null
  }

  async buscarPorPublicSlug(publicSlug: string): Promise<Channel | null> {
    return this.channels.find((channel) => channel.publicSlug === publicSlug) ?? null
  }

  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> {
    return this.channels.filter((channel) => channel.tipsterId === tipsterId)
  }

  async atualizarBotToken(): Promise<void> {}
}

class TipsterRepositoryFake implements TipsterRepository {
  constructor(private readonly tipster: Tipster) {}

  async salvar(): Promise<void> {}
  async buscarPorId(id: string): Promise<Tipster | null> {
    return id === this.tipster.id ? this.tipster : null
  }
  async buscarPorEmail(email: string): Promise<Tipster | null> {
    return email === this.tipster.email ? this.tipster : null
  }
  async existeEmail(email: string): Promise<boolean> {
    return email === this.tipster.email
  }
}

function createUseCase(channelRepository: ChannelRepositoryFake) {
  const tipster = new Tipster(
    'tipster-1',
    'pro@tipsfy.io',
    'hash',
    'PRO',
    new Date(),
  )
  return new CriarCanalUseCase(
    channelRepository,
    new TipsterRepositoryFake(tipster),
  )
}

describe('CriarCanalUseCase public slug', () => {
  it('transliterates the channel name into a normalized public slug', async () => {
    const channels = new ChannelRepositoryFake()
    const created = await createUseCase(channels).execute({
      tipsterId: 'tipster-1',
      telegramChatId: '-1001',
      botTokenEnc: null,
      name: 'Sinais Futebol VIP',
    })

    expect(created.publicSlug).toBe('sinais-futebol-vip')
    expect(channels.channels).toContain(created)
  })

  it('adds the next numeric suffix when a slug is already taken', async () => {
    const channels = new ChannelRepositoryFake()
    channels.channels.push(
      new Channel('existing-1', 'other-tipster', '-1001', null, 'Existing', 'sinais-futebol-vip'),
      new Channel('existing-2', 'other-tipster', '-1002', null, 'Existing 2', 'sinais-futebol-vip-2'),
    )

    const created = await createUseCase(channels).execute({
      tipsterId: 'tipster-1',
      telegramChatId: '-1003',
      botTokenEnc: null,
      name: 'Sinais Futebol VIP',
    })

    expect(created.publicSlug).toBe('sinais-futebol-vip-3')
  })

  it('uses a non-empty random fallback when the name has no alphanumeric characters', async () => {
    const created = await createUseCase(new ChannelRepositoryFake()).execute({
      tipsterId: 'tipster-1',
      telegramChatId: '-1001',
      botTokenEnc: null,
      name: '🔥✨',
    })

    expect(created.publicSlug).toMatch(/^canal-[0-9a-f]{6}$/)
  })
})