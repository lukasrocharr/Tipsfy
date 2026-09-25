import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaChannelRepository } from '../../../../infrastructure/database/PrismaChannelRepository'
import { getAuthenticatedTipsterId } from '../../auth/session'
import { planUseCasesFactory } from '../../../../infrastructure/factories/planUseCaseFactory'

const planSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().positive(),
  period: z.enum(['monthly', 'quarterly', 'annual']),
  active: z.boolean().default(true),
  description: z.string().optional(),
})

async function ownedChannel(id: string, tipsterId: string) {
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  return channel && channel.tipsterId === tipsterId ? channel : null
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id } = await context.params
  if (!await ownedChannel(id, tipsterId)) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })
  const plans = await planUseCasesFactory().listar.execute(id)
  return NextResponse.json({ plans })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id } = await context.params
  if (!await ownedChannel(id, tipsterId)) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })
  const parsed = planSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Dados do plano inválidos.' }, { status: 400 })
  const plan = await planUseCasesFactory().criar.execute({ ...parsed.data, channelId: id })
  return NextResponse.json({ plan }, { status: 201 })
}
