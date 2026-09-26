import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaAuditLogRepository } from '../../../../../infrastructure/database/PrismaAuditLogRepository'
import { PrismaChannelRepository } from '../../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaTipRepository } from '../../../../../infrastructure/database/PrismaTipRepository'
import { PrismaTipsterRepository } from '../../../../../infrastructure/database/PrismaTipsterRepository'
import { AesCriptografiaService } from '../../../../../infrastructure/crypto/AesCriptografiaService'
import { TelegramClientGrammy } from '../../../../../infrastructure/telegram/TelegramClientGrammy'
import { RegistrarTipUseCase } from '../../../../../application/use-cases/tips/RegistrarTipUseCase'
import { EnviarTipAoCanalUseCase } from '../../../../../application/use-cases/tips/EnviarTipAoCanalUseCase'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

const tipSchema = z.object({
  id: z.string().optional(),
  sport: z.string().trim().min(1),
  event: z.string().trim().min(1),
  market: z.string().trim().min(1).default('Resultado'),
  odds: z.number().positive(),
  units: z.number().positive(),
  result: z.enum(['green', 'red', 'void', 'pending']).default('pending'),
  date: z.string().trim().optional(),
  potentialReturn: z.number().nullable().optional(),
  bookmaker: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  broadcastToChannelIds: z.array(z.string().trim().min(1)).optional(),
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

  const tips = await new PrismaTipRepository().listarPorCanal(id)
  return NextResponse.json({ tips })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  if (!await ownedChannel(id, tipsterId)) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })

  const parsed = tipSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Dados da tip inválidos.' }, { status: 400 })

  const tip = await new RegistrarTipUseCase(
    new PrismaTipRepository(),
    new PrismaChannelRepository(),
    new PrismaTipsterRepository(),
    new EnviarTipAoCanalUseCase(new TelegramClientGrammy(), new AesCriptografiaService(process.env.ENCRYPTION_KEY), new PrismaAuditLogRepository()),
  ).execute({
    ...parsed.data,
    channelId: id,
    tipsterId,
  })

  return NextResponse.json({ tip }, { status: 201 })
}
