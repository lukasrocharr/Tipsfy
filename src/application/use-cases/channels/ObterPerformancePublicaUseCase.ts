import { ObterEstatisticasDoCanalUseCase } from '../tips/ObterEstatisticasDoCanalUseCase'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { TipRepository } from '../../ports/TipRepository'
import type { TipsterRepository } from '../../ports/TipsterRepository'
import { RecursoNaoDisponivelNoPlanoError } from '../../../domain/errors/RecursoNaoDisponivelNoPlanoError'

export type PublicPerformanceResult = {
  channelName: string
  stats: {
    total: number
    wins: number
    losses: number
    pending: number
    winRate: number
    roi: number
    profit: number
    settled: number
  }
  recentTips: Array<{
    id: string
    sport: string
    event: string
    market: string
    odds: number
    units: number
    result: 'green' | 'red' | 'void' | 'pending'
    date: string
    bookmaker: string | null
  }>
}

export class ObterPerformancePublicaUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly tipRepository: TipRepository,
    private readonly tipsterRepository: TipsterRepository,
  ) {}

  async execute(input: { publicSlug: string }): Promise<PublicPerformanceResult> {
    const channel = await this.channelRepository.buscarPorPublicSlug(input.publicSlug)

    if (!channel) {
      throw new Error('Página pública não encontrada.')
    }

    const tipster = await this.tipsterRepository.buscarPorId(channel.tipsterId)
    if (!tipster) throw new Error('Tipster não encontrado.')

    if (tipster.planTier === 'STARTER') {
      throw new RecursoNaoDisponivelNoPlanoError(tipster.planTier)
    }

    const stats = await new ObterEstatisticasDoCanalUseCase(this.tipRepository).execute({ channelId: channel.id })
    const recentTips = (await this.tipRepository.listarPorCanal(channel.id))
      .filter(tip => tip.result !== 'pending')
      .slice(0, 8)
      .map(tip => ({
        id: tip.id,
        sport: tip.sport,
        event: tip.event,
        market: tip.market,
        odds: tip.odds,
        units: tip.units,
        result: tip.result,
        date: tip.date,
        bookmaker: tip.bookmaker,
      }))

    // NUNCA devem sair daqui: email do tipster, pagamentos, lista de assinantes,
    // token/credenciais, dados bancários, histórico financeiro sensível e qualquer campo
    // novo que não faça parte do contrato público explícito.
    const publicView: PublicPerformanceResult = {
      channelName: channel.name,
      stats,
      recentTips,
    }

    return publicView
  }
}
