/**
 * Caso de uso para remover um plano do catálogo do canal.
 * A decisão de exclusão é mantida separada do handler para permitir auditoria futura.
 */
import type { PlanRepository } from '../../ports/PlanRepository'

export class RemoverPlanoUseCase {
  constructor(private readonly repository: PlanRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repository.buscarPorId(id))) throw new Error('Plano não encontrado.')
    await this.repository.remover(id)
  }
}
