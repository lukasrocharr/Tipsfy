import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaChannelRepository } from '../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaPlanRepository } from '../../../../infrastructure/database/PrismaPlanRepository'
import { getAuthenticatedTipsterId } from '../../auth/session'
import { planUseCasesFactory } from '../../../../infrastructure/factories/planUseCaseFactory'

const updateSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().positive(),
  period: z.enum(['monthly', 'quarterly', 'annual']),
  active: z.boolean().default(true),
  description: z.string().optional(),
})

async function getOwnedPlan(channelId: string, planId: string, tipsterId: string) {
  const channel = await new PrismaChannelRepository().buscarPorId(channelId)
  const plan = await new PrismaPlanRepository().buscarPorId(planId)
  return channel && channel.tipsterId === tipsterId && plan && plan.channelId === channelId ? plan : null
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; planId: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id, planId } = await context.params
  if (!await getOwnedPlan(id, planId, tipsterId)) return NextResponse.json({ message: 'Plano não encontrado.' }, { status: 404 })
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Dados do plano inválidos.' }, { status: 400 })
  const plan = await planUseCasesFactory().atualizar.execute({ ...parsed.data, id: planId })
  return NextResponse.json({ plan })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; planId: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id, planId } = await context.params
  if (!await getOwnedPlan(id, planId, tipsterId)) return NextResponse.json({ message: 'Plano não encontrado.' }, { status: 404 })
  await planUseCasesFactory().remover.execute(planId)
  return new NextResponse(null, { status: 204 })
}
