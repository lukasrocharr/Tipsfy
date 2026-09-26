import { calcularRoi, calcularTaxaDeAcerto } from '../../../domain/services/EstatisticasDeTips'
import type { TipRepository } from '../../ports/TipRepository'

export class ObterEstatisticasDoCanalUseCase {
  constructor(private readonly repository: TipRepository) {}

  async execute(input: { channelId: string }) {
    const tips = await this.repository.listarPorCanal(input.channelId)
    return {
      total: tips.length,
      wins: tips.filter(tip => tip.result === 'green').length,
      losses: tips.filter(tip => tip.result === 'red').length,
      pending: tips.filter(tip => tip.result === 'pending').length,
      winRate: calcularTaxaDeAcerto(tips),
      roi: calcularRoi(tips),
      profit: tips.reduce((sum, tip) => {
        if (tip.result === 'green') return sum + tip.units * (tip.odds - 1)
        if (tip.result === 'red') return sum - tip.units
        return sum
      }, 0),
      settled: tips.filter(tip => tip.result === 'green' || tip.result === 'red').length,
    }
  }
}
