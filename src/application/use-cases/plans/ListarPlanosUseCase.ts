/**
 * Caso de uso de leitura do catálogo de planos de um canal.
 * O repositório já devolve o formato de domínio que a interface web serializa.
 */
import type { Plan } from '../../../domain/entities/Plan'
import type { PlanRepository } from '../../ports/PlanRepository'

export class ListarPlanosUseCase {
  constructor(private readonly repository: PlanRepository) {}

  execute(channelId: string): Promise<Plan[]> {
    return this.repository.listarPorChannelId(channelId)
  }
}
