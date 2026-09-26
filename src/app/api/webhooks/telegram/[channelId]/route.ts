import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  message: z.object({
    text: z.string().optional(),
    from: z.object({ id: z.union([z.string(), z.number()]).optional(), username: z.string().optional() }).optional(),
  }).optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ ok: true })

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: true })

  const message = parsed.data.message
  const text = message?.text
  const from = message?.from
  if (!text || !text.startsWith('/start ') || !from?.id) return NextResponse.json({ ok: true })

  const token = text.replace('/start ', '').trim()
  if (!token) return NextResponse.json({ ok: true })

  try {
    const { VincularTelegramUseCase } = await import('../../../../../application/use-cases/subscriptions/VincularTelegramUseCase')
    const { PrismaSubscriberRepository } = await import('../../../../../infrastructure/database/PrismaSubscriberRepository')
    const subscriberRepository = new PrismaSubscriberRepository()
    await new VincularTelegramUseCase(subscriberRepository).execute({
      linkToken: token,
      telegramUserId: String(from.id),
      telegramUsername: from.username ? `@${from.username}` : null,
    })
  } catch {
    // ignora token inválido sem quebrar o webhook do Telegram.
  }

  return NextResponse.json({ ok: true })
}
