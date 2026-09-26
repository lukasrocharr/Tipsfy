import type { Tip } from '../entities/Tip'

/**
 * Fórmula mantida exatamente igual ao protótipo em data.ts, movida para o domínio.
 * GREEN: ganho = units * (odds - 1)
 * RED: perda = -units
 * VOID: fora do cálculo
 */
export function calcularTaxaDeAcerto(tips: Tip[]): number {
  const settled = tips.filter(tip => tip.result === 'green' || tip.result === 'red')
  if (settled.length === 0) return 0

  const wins = settled.filter(tip => tip.result === 'green').length
  return Number(((wins / settled.length) * 100).toFixed(2))
}

export function calcularRoi(tips: Tip[]): number {
  const settled = tips.filter(tip => tip.result !== 'pending' && tip.result !== 'void')
  if (settled.length === 0) return 0

  const totalUnits = settled.reduce((sum, tip) => sum + tip.units, 0)
  if (totalUnits === 0) return 0

  const profit = settled.reduce((sum, tip) => {
    if (tip.result === 'green') return sum + tip.units * (tip.odds - 1)
    if (tip.result === 'red') return sum - tip.units
    return sum
  }, 0)

  return (profit / totalUnits) * 100
}
