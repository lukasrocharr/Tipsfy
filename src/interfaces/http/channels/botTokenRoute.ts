import { NextResponse } from 'next/server'
import { PrismaChannelRepository } from '../../../infrastructure/database/PrismaChannelRepository'
import { botUseCasesFactory } from '../../../infrastructure/factories/botUseCaseFactory'
import { getAuthenticatedTipsterId } from '../auth/session'

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id } = await context.params
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })
  await botUseCasesFactory().desconectar.execute(id)
  return new NextResponse(null, { status: 204 })
}
