import { Plan, type PlanPeriod } from '../../domain/entities/Plan'
import type { PlanRepository } from '../../application/ports/PlanRepository'
import { prisma } from './prisma'

export class PrismaPlanRepository implements PlanRepository {
  async salvar(plan: Plan): Promise<void> {
    await prisma.plan.create({ data: this.toPersistence(plan) })
  }

  async atualizar(plan: Plan): Promise<void> {
    await prisma.plan.update({ where: { id: plan.id }, data: this.toPersistence(plan) })
  }

  async buscarPorId(id: string): Promise<Plan | null> {
    const record = await prisma.plan.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async buscarPorCheckoutSlug(checkoutSlug: string): Promise<Plan | null> {
    const record = await prisma.plan.findUnique({ where: { checkoutSlug } })
    return record ? this.toDomain(record) : null
  }

  async listarPorChannelId(channelId: string): Promise<Plan[]> {
    const records = await prisma.plan.findMany({ where: { channelId }, orderBy: { createdAt: 'asc' } })
    return records.map(record => this.toDomain(record))
  }

  async existeCheckoutSlug(checkoutSlug: string): Promise<boolean> {
    return (await prisma.plan.count({ where: { checkoutSlug } })) > 0
  }

  async remover(id: string): Promise<void> {
    await prisma.plan.delete({ where: { id } })
  }

  private toPersistence(plan: Plan) {
    return {
      id: plan.id,
      channelId: plan.channelId,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      active: plan.active,
      description: plan.description,
      subscribers: plan.subscribers,
      checkoutSlug: plan.checkoutSlug,
    }
  }

  private toDomain(record: { id: string; channelId: string; name: string; price: { toNumber(): number }; period: string; active: boolean; description: string | null; subscribers: number; checkoutSlug: string }): Plan {
    return new Plan(record.id, record.name, record.price.toNumber(), record.period as PlanPeriod, record.active, record.description ?? undefined, record.channelId, record.checkoutSlug, record.subscribers)
  }
}