/**
 * Porta de persistência dos assinantes finais do canal.
 */
import type { Subscriber } from '../../domain/entities/Subscriber'

export interface SubscriberRepository {
  buscarPorEmail(email: string, channelId: string): Promise<Subscriber | null>
  buscarPorId(id: string): Promise<Subscriber | null>
  buscarPorLinkToken(linkToken: string): Promise<Subscriber | null>
  listarPorCanal(channelId: string): Promise<Subscriber[]>
  salvar(subscriber: Subscriber): Promise<void>
  atualizarVinculo(id: string, dados: { telegram?: string | null; telegramId?: string | null; pendingLinkToken?: string | null }): Promise<void>
}
