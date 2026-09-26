import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AtualizarPreferenciasDeNotificacaoUseCase } from '../../../application/use-cases/tipster/AtualizarPreferenciasDeNotificacaoUseCase'
import { PrismaTipsterRepository } from '../../../infrastructure/database/PrismaTipsterRepository'
import { getAuthenticatedTipsterId } from '../auth/session'

const notificationPreferencesSchema = z.object({
  newSubscriber: z.boolean(),
  payment: z.boolean(),
  delinquent: z.boolean(),
  tips: z.boolean(),
  weekly: z.boolean(),
})

export async function PATCH(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = notificationPreferencesSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Preferências inválidas.' }, { status: 400 })

  const result = await new AtualizarPreferenciasDeNotificacaoUseCase(new PrismaTipsterRepository()).execute({
    tipsterId,
    preferences: parsed.data,
  })

  return NextResponse.json({ tipster: result })
}
