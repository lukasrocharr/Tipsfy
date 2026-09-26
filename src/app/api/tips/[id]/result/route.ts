import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MarcarResultadoDoTipUseCase } from '../../../../../application/use-cases/tips/MarcarResultadoDoTipUseCase'
import { PrismaChannelRepository } from '../../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaTipRepository } from '../../../../../infrastructure/database/PrismaTipRepository'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

const resultSchema = z.object({
  result: z.enum(['green', 'red', 'void', 'pending']),
})

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  const parsed = resultSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Resultado inválido.' }, { status: 400 })

  const tip = await new PrismaTipRepository().buscarPorId(id)
  if (!tip) return NextResponse.json({ message: 'Tip não encontrada.' }, { status: 404 })

  const channel = await new PrismaChannelRepository().buscarPorId(tip.channelId)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Tip não encontrada.' }, { status: 404 })

  await new MarcarResultadoDoTipUseCase(new PrismaTipRepository()).execute({ id, result: parsed.data.result })
  return NextResponse.json({ ok: true })
}
