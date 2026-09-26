import { NextResponse } from 'next/server'
import { z } from 'zod'
import { BotSemPermissaoDeAdminError } from '../../../domain/errors/BotSemPermissaoDeAdminError'
import { TokenInvalidoError } from '../../../domain/errors/TokenInvalidoError'
import { PrismaChannelRepository } from '../../../infrastructure/database/PrismaChannelRepository'
import { botUseCasesFactory } from '../../../infrastructure/factories/botUseCaseFactory'
import { getAuthenticatedTipsterId } from '../auth/session'

const connectSchema = z.object({ token: z.string().min(1), chatId: z.string().min(1) })

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const { id } = await context.params
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })
  const parsed = connectSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Token ou canal inválido.' }, { status: 400 })
  try {
    await botUseCasesFactory().conectar.execute({ channelId: id, ...parsed.data })
    return NextResponse.json({ connected: true })
  } catch (error) {
    if (error instanceof BotSemPermissaoDeAdminError) return NextResponse.json({ message: error.message }, { status: 403 })
    if (error instanceof TokenInvalidoError) return NextResponse.json({ message: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Não foi possível conectar o bot.' }, { status: 502 })
  }
}
