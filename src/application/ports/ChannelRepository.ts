/**
 * Porta de persistência dos canais do tipster.
 * Consultas por proprietário permitem verificar ownership antes de qualquer mutação.
 */
import type { Channel } from '../../domain/entities/Channel'

export interface ChannelRepository {
  salvar(channel: Channel): Promise<void>
  buscarPorId(id: string): Promise<Channel | null>
  listarPorTipsterId(tipsterId: string): Promise<Channel[]>
}