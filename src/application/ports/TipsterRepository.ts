/**
 * Porta de persistência usada pelos casos de uso de tipster.
 * O contrato permite trocar Prisma por um fake nos testes sem alterar a regra de negócio.
 */
import type { Tipster } from '../../domain/entities/Tipster'

export interface TipsterRepository {
  salvar(tipster: Tipster): Promise<void>
  buscarPorId(id: string): Promise<Tipster | null>
  buscarPorEmail(email: string): Promise<Tipster | null>
  existeEmail(email: string): Promise<boolean>
}