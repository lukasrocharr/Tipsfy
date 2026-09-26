import { describe, expect, it, vi } from 'vitest'
import { ObterMelhoresOddsUseCase } from '../../src/application/use-cases/odds/ObterMelhoresOddsUseCase'
import type { OddsCacheRepository } from '../../src/application/ports/OddsCacheRepository'
import type { OddsProvider } from '../../src/application/ports/OddsProvider'

describe('ObterMelhoresOddsUseCase', () => {
  it('não chama o provider de novo quando o cache ainda está válido', async () => {
    const provider = { buscarOddsPorEsporte: vi.fn(async () => []) }
    const cache: OddsCacheRepository = {
      buscarPorSportKey: vi.fn(async () => ({
        sportKey: 'soccer_brazil_campeonato',
        payload: [
          {
            eventId: 'evt-1',
            sportKey: 'soccer_brazil_campeonato',
            homeTeam: 'Flamengo',
            awayTeam: 'Palmeiras',
            selection: 'Flamengo',
            price: 2.4,
            bookmaker: 'Betano',
            market: 'h2h',
          },
        ],
        updatedAt: new Date(),
      })),
      salvar: vi.fn(async () => {}),
    }

    const useCase = new ObterMelhoresOddsUseCase(provider, cache)
    const result = await useCase.execute({ sportKey: 'soccer_brazil_campeonato' })

    expect(result).toHaveLength(1)
    expect(result[0].price).toBe(2.4)
    expect(provider.buscarOddsPorEsporte).not.toHaveBeenCalled()
  })

  it('propaga a falha do provedor quando não há cache para fallback', async () => {
    const provider = { buscarOddsPorEsporte: vi.fn(async () => { throw new Error('provider-down') }) }
    const cache: OddsCacheRepository = {
      buscarPorSportKey: vi.fn(async () => null),
      salvar: vi.fn(async () => {}),
    }

    const useCase = new ObterMelhoresOddsUseCase(provider, cache)
    await expect(useCase.execute({ sportKey: 'soccer_brazil_campeonato' })).rejects.toThrow('provider-down')
  })

  it('usa o cache expirado como fallback quando o provedor externo falha', async () => {
    const provider: OddsProvider = { buscarOddsPorEsporte: vi.fn(async () => { throw new Error('provider-down') }) }
    const cachedOdds = [{
      eventId: 'evt-1',
      sportKey: 'soccer_brazil_campeonato',
      homeTeam: 'Flamengo',
      awayTeam: 'Palmeiras',
      selection: 'Flamengo',
      price: 2.4,
      bookmaker: 'Betano',
      market: 'h2h',
    }]
    const cache: OddsCacheRepository = {
      buscarPorSportKey: vi.fn(async () => ({
        sportKey: 'soccer_brazil_campeonato',
        payload: cachedOdds,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      })),
      salvar: vi.fn(async () => {}),
    }

    const useCase = new ObterMelhoresOddsUseCase(provider, cache)

    await expect(useCase.execute({ sportKey: 'soccer_brazil_campeonato' })).resolves.toEqual(cachedOdds)
  })

  it('reconsulta um cache vazio antigo quando o provedor fica disponível', async () => {
    const provider: OddsProvider = {
      buscarOddsPorEsporte: vi.fn(async () => [{
        id: 'evt-2',
        sportKey: 'soccer_brazil_campeonato',
        homeTeam: 'Flamengo',
        awayTeam: 'Palmeiras',
        commenceTime: '2026-09-26T20:00:00Z',
        bookmakers: [{ key: 'book', title: 'Casa', markets: [{ key: 'h2h', outcomes: [{ name: 'Flamengo', price: 2.5 }] }] }],
      }]),
    }
    const cache: OddsCacheRepository = {
      buscarPorSportKey: vi.fn(async () => ({
        sportKey: 'soccer_brazil_campeonato',
        payload: [],
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      })),
      salvar: vi.fn(async () => {}),
    }

    const result = await new ObterMelhoresOddsUseCase(provider, cache).execute({ sportKey: 'soccer_brazil_campeonato' })

    expect(result).toHaveLength(1)
    expect(result[0].price).toBe(2.5)
    expect(provider.buscarOddsPorEsporte).toHaveBeenCalledOnce()
  })
})
