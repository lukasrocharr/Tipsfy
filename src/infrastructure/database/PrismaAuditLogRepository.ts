import type { AuditLogRepository } from '../../application/ports/AuditLogRepository'
import { AuditLog } from '../../domain/entities/AuditLog'
import { prisma } from './prisma'

export class PrismaAuditLogRepository implements AuditLogRepository {
  async salvar(log: AuditLog): Promise<void> {
    await prisma.auditLog.create({
      data: {
        subscriptionId: log.subscriptionId,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      },
    })
  }
}
