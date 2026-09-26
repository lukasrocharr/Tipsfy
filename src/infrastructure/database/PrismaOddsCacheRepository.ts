import type { OddsCacheRepository } from '../../application/ports/OddsCacheRepository'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export class PrismaOddsCacheRepository implements OddsCacheRepository {
  async buscarPorSportKey(sportKey: string) {
    const record = await prisma.oddsCache.findUnique({ where: { sportKey } })
    if (!record) return null
    return {
      sportKey: record.sportKey,
      payload: record.payload as unknown,
      updatedAt: record.updatedAt,
    }
  }

  // O cache recebe objetos serializáveis do OddsProvider; o tipo Prisma fica restrito à fronteira de persistência.
  async salvar(sportKey: string, payload: Prisma.InputJsonValue): Promise<void> {
    await prisma.oddsCache.upsert({
      where: { sportKey },
      update: { payload, updatedAt: new Date() },
      create: { sportKey, payload },
    })
  }
}
