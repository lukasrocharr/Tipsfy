import { Tipster } from '../../domain/entities/Tipster'
import type { TipsterRepository } from '../../application/ports/TipsterRepository'
import { Prisma } from '@prisma/client'
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
        name: tipster.name,
        bio: tipster.bio,
        website: tipster.website,
        notificationPreferences: tipster.notificationPreferences,
        bankDetails: tipster.bankDetails ?? Prisma.DbNull,
        deletedAt: tipster.deletedAt,
        deletionReason: tipster.deletionReason,
      },
    })
  }

  async atualizar(tipster: Tipster): Promise<void> {
    await prisma.tipster.update({
      where: { id: tipster.id },
      data: {
        email: tipster.email,
        passwordHash: tipster.passwordHash,
        planTier: tipster.planTier,
        trialEndsAt: tipster.trialEndsAt,
        name: tipster.name,
        bio: tipster.bio,
        website: tipster.website,
        notificationPreferences: tipster.notificationPreferences,
        bankDetails: tipster.bankDetails ?? Prisma.DbNull,
        deletedAt: tipster.deletedAt,
        deletionReason: tipster.deletionReason,
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

  private toDomain(record: {
    id: string
    email: string
    passwordHash: string
    planTier: string
    trialEndsAt: Date
    name?: string | null
    bio?: string | null
    website?: string | null
    notificationPreferences?: any
    bankDetails?: any
    deletedAt?: Date | null
    deletionReason?: string | null
  }): Tipster {
    const planTier = record.planTier === 'PRO' ? 'PRO' : 'STARTER'
    return new Tipster(
      record.id,
      record.email,
      record.passwordHash,
      planTier,
      record.trialEndsAt,
      record.name ?? '',
      record.bio ?? '',
      record.website ?? '',
      record.notificationPreferences ?? {
        newSubscriber: true,
        payment: true,
        delinquent: true,
        tips: false,
        weekly: true,
      },
      record.bankDetails ?? null,
      record.deletedAt ?? null,
      record.deletionReason ?? null,
    )
  }
}
