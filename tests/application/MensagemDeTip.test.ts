import { describe, expect, it } from 'vitest'
import { Tip } from '../../src/domain/entities/Tip'
import { MensagemDeTip } from '../../src/domain/value-objects/MensagemDeTip'

describe('MensagemDeTip', () => {
  it('monta o texto do tip em um template consistente', () => {
    const tip = new Tip(
      'tip-1',
      'channel-1',
      'Futebol',
      'Flamengo x Palmeiras',
      'Ambas Marcam',
      2.5,
      1.5,
      'pending',
      '2026-09-25',
      null,
      'Bet365',
      'Jogo muito equilibrado',
    )

    expect(MensagemDeTip.criar(tip).texto).toBe(
      '🎯 Futebol\n' +
      '🏟️ Flamengo x Palmeiras\n' +
      '📈 Mercado: Ambas Marcam\n' +
      '⚽ Odd: 2.50\n' +
      '💰 Unidades: 1.50\n' +
      '🏦 Casa: Bet365\n' +
      '📝 Jogo muito equilibrado',
    )
  })
})
