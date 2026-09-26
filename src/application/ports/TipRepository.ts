/**
 * Porta de persistência das tips do canal.
 */
import type { Tip, TipResult } from '../../domain/entities/Tip'

export interface TipRepository {
  salvar(tip: Tip): Promise<void>
  atualizar(tip: Tip): Promise<void>
  buscarPorId(id: string): Promise<Tip | null>
  listarPorCanal(channelId: string): Promise<Tip[]>
  remover(id: string): Promise<void>
  atualizarResultado(id: string, result: TipResult): Promise<void>
}
