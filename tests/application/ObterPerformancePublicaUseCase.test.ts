import { describe, expect, it, vi } from 'vitest'
import { ObterPerformancePublicaUseCase } from '../../src/application/use-cases/channels/ObterPerformancePublicaUseCase'
import { RecursoNaoDisponivelNoPlanoError } from '../../src/domain/errors/RecursoNaoDisponivelNoPlanoError'
import { Channel } from '../../src/domain/entities/Channel'
import { Tip } from '../../src/domain/entities/Tip'
import { Tipster } from '../../src/domain/entities/Tipster'

describe('ObterPerformancePublicaUseCase', () => {
  it('não expõe campos sensíveis mesmo com novos campos na entidade Channel', async () => {
    const channel = new Channel('channel-1', 'tipster-1', 'chat-1', 'enc', 'Canal Premium', 'canal-premium')
    const tipster = new Tipster('tipster-1', 'user@example.com', 'hash', 'PRO', new Date())
    const tip = new Tip('tip-1', 'channel-1', 'Futebol', 'Flamengo x Palmeiras', 'Resultado', 2.5, 1, 'green', '2026-09-25', 1.5, 'Bet365', 'Boa análise')

    const channelRepository = {
      salvar: vi.fn(),
      buscarPorId: vi.fn(async () => channel),
      buscarPorPublicSlug: vi.fn(async () => channel),
      listarPorTipsterId: vi.fn(async () => [channel]),
      atualizarBotToken: vi.fn(),
      listarTodos: vi.fn(async () => [channel]),
    }
    const tipRepository = {
      salvar: vi.fn(),
      atualizar: vi.fn(),
      buscarPorId: vi.fn(async () => tip),
      listarPorCanal: vi.fn(async () => [tip]),
      remover: vi.fn(),
      atualizarResultado: vi.fn(),
    }
    const tipsterRepository = {
      salvar: vi.fn(),
      buscarPorId: vi.fn(async () => tipster),
      buscarPorEmail: vi.fn(async () => tipster),
      existeEmail: vi.fn(async () => false),
    }

    const result = await new ObterPerformancePublicaUseCase(channelRepository as any, tipRepository as any, tipsterRepository as any).execute({ publicSlug: 'canal-premium' })

    expect(result).toMatchObject({
      channelName: 'Canal Premium',
      recentTips: [{ id: 'tip-1' }],
      stats: { total: 1 },
    })
    expect(result).not.toHaveProperty('email')
    expect(result).not.toHaveProperty('payments')
    expect(result).not.toHaveProperty('subscribers')

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('user@example.com')
    expect(serialized).not.toContain('hash')
  })

  it('bloqueia acesso de tipster STARTER com RecursoNaoDisponivelNoPlanoError', async () => {
    const channel = new Channel('channel-1', 'tipster-1', 'chat-1', 'enc', 'Canal Starter', 'canal-starter')
    const tipster = new Tipster('tipster-1', 'user@example.com', 'hash', 'STARTER', new Date())

    const useCase = new ObterPerformancePublicaUseCase(
      {
        salvar: vi.fn(),
        buscarPorId: vi.fn(async () => channel),
        buscarPorPublicSlug: vi.fn(async () => channel),
        listarPorTipsterId: vi.fn(async () => [channel]),
        atualizarBotToken: vi.fn(),
        listarTodos: vi.fn(async () => [channel]),
      } as any,
      {
        salvar: vi.fn(),
        atualizar: vi.fn(),
        buscarPorId: vi.fn(async () => null),
        listarPorCanal: vi.fn(async () => []),
        remover: vi.fn(),
        atualizarResultado: vi.fn(),
      } as any,
      {
        salvar: vi.fn(),
        buscarPorId: vi.fn(async () => tipster),
        buscarPorEmail: vi.fn(async () => tipster),
        existeEmail: vi.fn(async () => false),
      } as any,
    )

    await expect(useCase.execute({ publicSlug: 'canal-starter' })).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
  })
})
