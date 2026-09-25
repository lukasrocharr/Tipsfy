import { Tipster } from '../../domain/entities/Tipster'
import type { TipsterRepository } from '../../application/ports/TipsterRepository'
import { prisma } from './prisma'

export class PrismaTipsterRepository implements TipsterRepository {
  async salvar(tipster: Tipster): Promise<void> {
    await prisma.tipster.create({
      data: {
        id: tipster.id,
        email: tipster.email,
        passwordHash: tipster.passwordHash,
        planTier: tipster.planTier,
        trialEndsAt: tipster.trialEndsAt,
      },
    })
  }

  async buscarPorEmail(email: string): Promise<Tipster | null> {
    const record = await prisma.tipster.findUnique({ where: { email } })
    return record ? this.toDomain(record) : null
  }

  async buscarPorId(id: string): Promise<Tipster | null> {
    const record = await prisma.tipster.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async existeEmail(email: string): Promise<boolean> {
    const count = await prisma.tipster.count({ where: { email } })
    return count > 0
  }

  private toDomain(record: { id: string; email: string; passwordHash: string; planTier: string; trialEndsAt: Date }): Tipster {
    const planTier = record.planTier === 'PRO' ? 'PRO' : 'STARTER'
    return new Tipster(record.id, record.email, record.passwordHash, planTier, record.trialEndsAt)
  }
}
