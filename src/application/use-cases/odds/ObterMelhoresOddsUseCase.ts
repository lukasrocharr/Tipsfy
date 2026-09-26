import type { OddsCacheRepository } from '../../ports/OddsCacheRepository'
import type { OddsEvent, OddsProvider } from '../../ports/OddsProvider'
import { escolherMelhoresOdds, type MelhorOdd } from '../../../domain/services/MelhorOdd'

const TTL_CACHE_SEM_EVENTOS_MS = 5 * 60 * 1000

export class ObterMelhoresOddsUseCase {
  constructor(
    private readonly provider: OddsProvider,
    private readonly cacheRepository: OddsCacheRepository,
    // TTL padrão de 60 min para respeitar o limite de 500 requisições/mês do plano gratuito.
    private readonly ttlMs = 60 * 60 * 1000,
  ) {}

  async execute(input: { sportKey: string; forceRefresh?: boolean }): Promise<MelhorOdd[]> {
    const cached = await this.cacheRepository.buscarPorSportKey(input.sportKey)
    const now = Date.now()
    const cachedOdds = cached && Array.isArray(cached.payload) ? cached.payload as MelhorOdd[] : null
    const cacheTtlMs = cachedOdds?.length === 0 ? TTL_CACHE_SEM_EVENTOS_MS : this.ttlMs

    if (!input.forceRefresh && cached && cachedOdds && now - cached.updatedAt.getTime() < cacheTtlMs) {
      return cachedOdds
    }

    try {
      const events = await this.provider.buscarOddsPorEsporte(input.sportKey)
      const bestOdds = events
        .map(event => escolherMelhoresOdds(event as any))
        .filter((odd): odd is MelhorOdd => Boolean(odd))

      await this.cacheRepository.salvar(input.sportKey, bestOdds)
      return bestOdds
    } catch (error) {
      if (cachedOdds && cachedOdds.length > 0) return cachedOdds
      throw error
    }
  }
}
