import { NextResponse } from 'next/server'
import { PrismaChannelRepository } from '../../../infrastructure/database/PrismaChannelRepository'
import { PrismaPlanRepository } from '../../../infrastructure/database/PrismaPlanRepository'

export async function GET(_request: Request, context: { params: Promise<{ planSlug: string }> }) {
  const { planSlug } = await context.params
  const plan = await new PrismaPlanRepository().buscarPorCheckoutSlug(planSlug)
  if (!plan || !plan.active) return NextResponse.json({ message: 'Plano não encontrado.' }, { status: 404 })
  const channel = await new PrismaChannelRepository().buscarPorId(plan.channelId)
  return NextResponse.json({
    plan: { id: plan.id, name: plan.name, price: plan.price, period: plan.period, description: plan.description, checkoutSlug: plan.checkoutSlug },
    channel: channel ? { id: channel.id, name: channel.name } : null,
  })
}
