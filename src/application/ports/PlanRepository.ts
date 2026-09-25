/**
 * Porta de persistência dos planos vinculados a um canal.
 * O contrato mantém os campos em formato próximo ao mock para reduzir acoplamento da tela.
 */
import type { Plan } from '../../domain/entities/Plan'

export interface PlanRepository {
  salvar(plan: Plan): Promise<void>
  atualizar(plan: Plan): Promise<void>
  buscarPorId(id: string): Promise<Plan | null>
  listarPorChannelId(channelId: string): Promise<Plan[]>
  existeCheckoutSlug(checkoutSlug: string): Promise<boolean>
  remover(id: string): Promise<void>
}