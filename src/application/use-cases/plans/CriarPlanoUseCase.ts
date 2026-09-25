/**
 * Caso de uso para cadastrar um plano no canal autorizado.
 * O slug é legível e recebe um sufixo aleatório curto para evitar colisões entre planos.
 */
import { randomUUID } from 'node:crypto'
import { Plan, type PlanPeriod } from '../../../domain/entities/Plan'
import type { PlanRepository } from '../../ports/PlanRepository'

export type CriarPlanoInput = { channelId: string; name: string; price: number; period: PlanPeriod; active: boolean; description?: string }

export class CriarPlanoUseCase {
  constructor(private readonly repository: PlanRepository) {}

  async execute(input: CriarPlanoInput): Promise<Plan> {
    const checkoutSlug = await this.criarSlugUnico(input.name)
    const plan = new Plan(randomUUID(), input.name, input.price, input.period, input.active, input.description, input.channelId, checkoutSlug)
    await this.repository.salvar(plan)
    return plan
  }

  private async criarSlugUnico(name: string): Promise<string> {
    const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plano'
    let slug = `${base}-${randomUUID().slice(0, 8)}`
    while (await this.repository.existeCheckoutSlug(slug)) slug = `${base}-${randomUUID().slice(0, 8)}`
    return slug
  }
}
