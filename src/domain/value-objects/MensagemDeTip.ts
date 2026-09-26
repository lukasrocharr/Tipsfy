import { Tip } from '../entities/Tip'

export class MensagemDeTip {
  public readonly texto: string

  private constructor(tip: Tip) {
    this.texto = [
      `🎯 ${tip.sport}`,
      `🏟️ ${tip.event}`,
      `📈 Mercado: ${tip.market}`,
      `⚽ Odd: ${Number(tip.odds).toFixed(2)}`,
      `💰 Unidades: ${Number(tip.units).toFixed(2)}`,
      `🏦 Casa: ${tip.bookmaker ?? '—'}`,
      `📝 ${tip.notes?.trim() || 'Sem observações.'}`,
    ].join('\n')
  }

  static criar(tip: Tip): MensagemDeTip {
    return new MensagemDeTip(tip)
  }
}
