/**
 * Caso de uso para editar os campos comerciais de um plano existente.
 * Identidade, canal e slug permanecem estáveis para não quebrar links já distribuídos.
 */
import { Plan, type PlanPeriod } from '../../../domain/entities/Plan'
import type { PlanRepository } from '../../ports/PlanRepository'

export type AtualizarPlanoInput = { id: string; name: string; price: number; period: PlanPeriod; active: boolean; description?: string }

export class AtualizarPlanoUseCase {
  constructor(private readonly repository: PlanRepository) {}

  async execute(input: AtualizarPlanoInput): Promise<Plan> {
    const current = await this.repository.buscarPorId(input.id)
    if (!current) throw new Error('Plano não encontrado.')
    const plan = new Plan(current.id, input.name, input.price, input.period, input.active, input.description, current.channelId, current.checkoutSlug, current.subscribers)
    await this.repository.atualizar(plan)
    return plan
  }
}
