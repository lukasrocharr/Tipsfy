import { describe, expect, it } from 'vitest'
import { Channel } from '../../src/domain/entities/Channel'
import { Tipster } from '../../src/domain/entities/Tipster'
import { LimiteDeCanaisExcedidoError } from '../../src/domain/errors/LimiteDeCanaisExcedidoError'
import { Periodicity } from '../../src/domain/value-objects/Periodicity'
import { CriarCanalUseCase } from '../../src/application/use-cases/channels/CriarCanalUseCase'
import type { ChannelRepository } from '../../src/application/ports/ChannelRepository'
import type { TipsterRepository } from '../../src/application/ports/TipsterRepository'

class ChannelRepositoryFake implements ChannelRepository {
  readonly channels: Channel[] = []

  async salvar(channel: Channel): Promise<void> {
    this.channels.push(channel)
  }

  async buscarPorId(id: string): Promise<Channel | null> {
    return this.channels.find(channel => channel.id === id) ?? null
  }

  async listarPorTipsterId(tipsterId: string): Promise<Channel[]> {
    return this.channels.filter(channel => channel.tipsterId === tipsterId)
  }
}

class TipsterRepositoryFake implements TipsterRepository {
  constructor(private readonly tipster: Tipster) {}

  async salvar(): Promise<void> {}
  async buscarPorId(): Promise<Tipster> { return this.tipster }
  async buscarPorEmail(): Promise<Tipster | null> { return this.tipster }
  async existeEmail(): Promise<boolean> { return true }
}

describe('Periodicity', () => {
  const baseDate = new Date('2026-01-15T12:00:00.000Z')

  it.each([
    ['monthly', '2026-02-15T12:00:00.000Z'],
    ['quarterly', '2026-04-15T12:00:00.000Z'],
    ['annual', '2027-01-15T12:00:00.000Z'],
  ] as const)('calcula vencimento %s', (period, expected) => {
    expect(new Periodicity(period).proximaDataDeVencimento(baseDate)).toEqual(new Date(expected))
  })
})

describe('CriarCanalUseCase', () => {
  const input = { tipsterId: 'tipster-1', telegramChatId: '-100', botTokenEnc: 'encrypted', name: 'Canal principal' }

  it('permite um canal para Starter e bloqueia o segundo', async () => {
    const repository = new ChannelRepositoryFake()
    const useCase = new CriarCanalUseCase(repository, new TipsterRepositoryFake(new Tipster('tipster-1', 'a@b.com', 'hash', 'STARTER', new Date())))
    await useCase.execute(input)
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(LimiteDeCanaisExcedidoError)
  })

  it('permite múltiplos canais para Pro', async () => {
    const repository = new ChannelRepositoryFake()
    const useCase = new CriarCanalUseCase(repository, new TipsterRepositoryFake(new Tipster('tipster-1', 'a@b.com', 'hash', 'PRO', new Date())))
    await useCase.execute(input)
    await expect(useCase.execute(input)).resolves.toBeInstanceOf(Channel)
  })
})