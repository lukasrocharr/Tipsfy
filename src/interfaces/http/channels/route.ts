import { NextResponse } from "next/server"
import { z } from "zod"
import { PrismaChannelRepository } from "../../../infrastructure/database/PrismaChannelRepository"
import { PrismaTipsterRepository } from "../../../infrastructure/database/PrismaTipsterRepository"
import { criarCanalUseCaseFactory } from "../../../infrastructure/factories/channelUseCaseFactory"
import { getAuthenticatedTipsterId } from "../auth/session"

const DEMO_TEST_EMAIL = "pro@tipsfy.io"

function isDemoTestTipster(email: string | null | undefined) {
  return email?.trim().toLowerCase() === DEMO_TEST_EMAIL
}

const channelSchema = z.object({
  telegramChatId: z.string().min(1),
  botTokenEnc: z.string().min(1).nullable().optional(),
  name: z.string().trim().min(1),
})

function toResponse(channel: {
  id: string
  tipsterId: string
  telegramChatId: string
  name: string
  publicSlug?: string | null
  botTokenEnc?: string | null
}) {
  return {
    id: channel.id,
    tipsterId: channel.tipsterId,
    telegramChatId: channel.telegramChatId,
    name: channel.name,
    publicSlug: channel.publicSlug ?? null,
    connected: Boolean(channel.botTokenEnc),
  }
}

export async function GET() {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId)
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })

  const tipster = await new PrismaTipsterRepository().buscarPorId(tipsterId)
  const channels = await new PrismaChannelRepository().listarPorTipsterId(
    tipsterId,
  )

  if (isDemoTestTipster(tipster?.email) && channels.length === 0) {
    return NextResponse.json({
      channels: [
        toResponse({
          id: "channel-demo-pro",
          tipsterId,
          telegramChatId: "demo-test",
          name: "Meu Canal",
          publicSlug: "meu-canal",
          botTokenEnc: null,
        }),
      ],
    })
  }

  return NextResponse.json({ channels: channels.map(toResponse) })
}

export async function POST(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId)
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })

  const tipster = await new PrismaTipsterRepository().buscarPorId(tipsterId)
  const parsed = channelSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return NextResponse.json({ message: "Dados do canal inválidos." }, {
      status: 400,
    })
  try {
    const channel = await criarCanalUseCaseFactory().execute({
      ...parsed.data,
      telegramChatId: isDemoTestTipster(tipster?.email)
        ? "demo-test"
        : parsed.data.telegramChatId,
      botTokenEnc: parsed.data.botTokenEnc ?? null,
      tipsterId,
    })
    return NextResponse.json({ channel: toResponse(channel) }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o canal."
    const status = message.includes("apenas um canal") ? 409 : 400
    return NextResponse.json({ message }, { status })
  }
}
