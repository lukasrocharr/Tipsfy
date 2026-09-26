import type { TipRepository } from '../../ports/TipRepository'
import type { TipResult } from '../../../domain/entities/Tip'

export class MarcarResultadoDoTipUseCase {
  constructor(private readonly repository: TipRepository) {}

  async execute(input: { id: string; result: TipResult }): Promise<void> {
    const tip = await this.repository.buscarPorId(input.id)
    if (!tip) throw new Error('Tip não encontrada.')

    await this.repository.atualizarResultado(input.id, input.result)
  }
}
