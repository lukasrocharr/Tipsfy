/**
 * Porta de auditoria para registrar cada decisão automática do motor de cobrança.
 * A persistência fica isolada na infraestrutura, enquanto o domínio decide o que logar.
 */
import type { AuditLog } from '../../domain/entities/AuditLog'

export interface AuditLogRepository {
  salvar(log: AuditLog): Promise<void>
}
