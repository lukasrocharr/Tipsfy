import { Tip, type TipResult } from '../../domain/entities/Tip'
import type { TipRepository } from '../../application/ports/TipRepository'
import { TipResult as PrismaTipResult } from '@prisma/client'
import { prisma } from './prisma'

export class PrismaTipRepository implements TipRepository {
  async salvar(tip: Tip): Promise<void> {
    await prisma.tip.create({
      data: {
        id: tip.id,
        channelId: tip.channelId,
        sport: tip.sport,
        event: tip.event,
        market: tip.market,
        odds: tip.odds,
        units: tip.units,
        result: this.paraTipResultDoPrisma(tip.result),
        date: tip.date,
        potentialReturn: tip.potentialReturn,
        bookmaker: tip.bookmaker,
        notes: tip.notes,
      },
    })
  }

  async atualizar(tip: Tip): Promise<void> {
    await prisma.tip.update({
      where: { id: tip.id },
      data: {
        channelId: tip.channelId,
        sport: tip.sport,
        event: tip.event,
        market: tip.market,
        odds: tip.odds,
        units: tip.units,
        result: this.paraTipResultDoPrisma(tip.result),
        date: tip.date,
        potentialReturn: tip.potentialReturn,
        bookmaker: tip.bookmaker,
        notes: tip.notes,
      },
    })
  }

  async buscarPorId(id: string): Promise<Tip | null> {
    const record = await prisma.tip.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async listarPorCanal(channelId: string): Promise<Tip[]> {
    const records = await prisma.tip.findMany({
      where: { channelId },
      orderBy: { date: 'desc' },
    })
    return records.map(record => this.toDomain(record))
  }

  async remover(id: string): Promise<void> {
    await prisma.tip.delete({ where: { id } })
  }

  async atualizarResultado(id: string, result: TipResult): Promise<void> {
    await prisma.tip.update({ where: { id }, data: { result: this.paraTipResultDoPrisma(result) } })
  }

  // O Prisma usa maiúsculas para este enum por convenção do schema; o domínio usa minúsculas por ser mais natural na regra de negócio. Este mapeamento isola essa diferença na camada de infraestrutura, sem vazar para o domínio.
  private paraTipResultDoPrisma(resultado: TipResult): PrismaTipResult {
    const resultados: Record<TipResult, PrismaTipResult> = {
      green: PrismaTipResult.GREEN,
      red: PrismaTipResult.RED,
      void: PrismaTipResult.VOID,
      pending: PrismaTipResult.PENDING,
    }
    return resultados[resultado]
  }

  private paraTipResultDoDominio(resultado: PrismaTipResult): TipResult {
    const resultados: Record<PrismaTipResult, TipResult> = {
      [PrismaTipResult.GREEN]: 'green',
      [PrismaTipResult.RED]: 'red',
      [PrismaTipResult.VOID]: 'void',
      [PrismaTipResult.PENDING]: 'pending',
    }
    return resultados[resultado]
  }

  private toDomain(record: {
    id: string
    channelId: string
    sport: string
    event: string
    market: string
    odds: number
    units: number
    result: PrismaTipResult
    date: string
    potentialReturn: number | null
    bookmaker: string | null
    notes: string | null
  }): Tip {
    return new Tip(
      record.id,
      record.channelId,
      record.sport,
      record.event,
      record.market,
      record.odds,
      record.units,
      this.paraTipResultDoDominio(record.result),
      record.date,
      record.potentialReturn,
      record.bookmaker,
      record.notes,
    )
  }
}
