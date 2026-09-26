import { describe, expect, it } from 'vitest'
import { calcularRoi, calcularTaxaDeAcerto } from '../../src/domain/services/EstatisticasDeTips'
import type { Tip } from '../../src/domain/entities/Tip'

const tip = (overrides: Partial<Tip> = {}): Tip => ({
  id: 'tip-1',
  channelId: 'channel-1',
  sport: 'Futebol',
  event: 'Flamengo x Palmeiras',
  market: 'Ambas Marcam – Sim',
  odds: 2.1,
  units: 1,
  result: 'pending',
  date: '2026-09-25',
  potentialReturn: 1.1,
  bookmaker: 'Bet365',
  notes: 'Teste',
  ...overrides,
})

describe('EstatisticasDeTips', () => {
  it('calcula taxa de acerto para lista só de green', () => {
    const tips = [tip({ result: 'green', odds: 2.5, units: 1 }), tip({ result: 'green', odds: 1.8, units: 2 })]
    expect(calcularTaxaDeAcerto(tips)).toBe(100)
  })

  it('calcula taxa de acerto para lista só de red', () => {
    const tips = [tip({ result: 'red', units: 1 }), tip({ result: 'red', units: 2 })]
    expect(calcularTaxaDeAcerto(tips)).toBe(0)
  })

  it('calcula taxa de acerto para mix de resultados e ignora void', () => {
    const tips = [
      tip({ id: '1', result: 'green', odds: 2.0, units: 1 }),
      tip({ id: '2', result: 'red', units: 1 }),
      tip({ id: '3', result: 'void', units: 1 }),
      tip({ id: '4', result: 'green', odds: 3.0, units: 1 }),
    ]
    expect(calcularTaxaDeAcerto(tips)).toBe(66.67)
  })

  it('calcula ROI para lista só de red e ignora void', () => {
    const tips = [tip({ id: '1', result: 'red', units: 1 }), tip({ id: '2', result: 'red', units: 2 }), tip({ id: '3', result: 'void', units: 1 })]
    expect(calcularRoi(tips)).toBe(-100)
  })

  it('calcula ROI para mix e lista vazia sem divisão por zero', () => {
    expect(calcularRoi([])).toBe(0)

    const tips = [
      tip({ id: '1', result: 'green', odds: 2.5, units: 1 }),
      tip({ id: '2', result: 'red', units: 1 }),
      tip({ id: '3', result: 'green', odds: 4.0, units: 2 }),
      tip({ id: '4', result: 'void', units: 1 }),
    ]
    expect(calcularRoi(tips)).toBe(162.5)
  })
})
