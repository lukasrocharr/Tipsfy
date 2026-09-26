import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaChannelRepository } from '../../../infrastructure/database/PrismaChannelRepository'
import { criarCanalUseCaseFactory } from '../../../infrastructure/factories/channelUseCaseFactory'
import { getAuthenticatedTipsterId } from '../auth/session'

const channelSchema = z.object({
  telegramChatId: z.string().min(1),
  botTokenEnc: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(1),
})

function toResponse(channel: { id: string; tipsterId: string; telegramChatId: string; name: string; botTokenEnc?: string | null }) {
  return { id: channel.id, tipsterId: channel.tipsterId, telegramChatId: channel.telegramChatId, name: channel.name, connected: Boolean(channel.botTokenEnc) }
}

export async function GET() {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const channels = await new PrismaChannelRepository().listarPorTipsterId(tipsterId)
  return NextResponse.json({ channels: channels.map(toResponse) })
}

export async function POST(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  const parsed = channelSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Dados do canal inválidos.' }, { status: 400 })
  try {
    const channel = await criarCanalUseCaseFactory().execute({ ...parsed.data, botTokenEnc: parsed.data.botTokenEnc ?? null, tipsterId })
    return NextResponse.json({ channel: toResponse(channel) }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível criar o canal.'
    const status = message.includes('apenas um canal') ? 409 : 400
    return NextResponse.json({ message }, { status })
  }
}
