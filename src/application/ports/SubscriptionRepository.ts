/**
 * Porta de persistência das assinaturas e de sua ativação após pagamento.
 */
import type { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription'

export interface SubscriptionRepository {
  salvar(subscription: Subscription): Promise<void>
  buscarPorId(id: string): Promise<Subscription | null>
  listarPorCanal(channelId: string): Promise<Subscription[]>
  atualizarStatus(id: string, status: SubscriptionStatus): Promise<void>
  listarAtivasVencidas(agora: Date, toleranceDays: number): Promise<Subscription[]>
  listarAtivasProximasDoVencimento(agora: Date, daysAhead: number): Promise<Subscription[]>
  contarAtivosPorCanal(channelId: string): Promise<number>
}
