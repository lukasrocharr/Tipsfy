import { NextResponse } from 'next/server'
import { PrismaTipRepository } from '../../../../../infrastructure/database/PrismaTipRepository'
import { ObterEstatisticasDoCanalUseCase } from '../../../../../application/use-cases/tips/ObterEstatisticasDoCanalUseCase'
import { PrismaChannelRepository } from '../../../../../infrastructure/database/PrismaChannelRepository'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })

  const stats = await new ObterEstatisticasDoCanalUseCase(new PrismaTipRepository()).execute({ channelId: id })
  return NextResponse.json(stats)
}
