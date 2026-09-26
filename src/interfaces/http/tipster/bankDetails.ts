import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AtualizarDadosBancariosUseCase } from '../../../application/use-cases/tipster/AtualizarDadosBancariosUseCase'
import { PrismaTipsterRepository } from '../../../infrastructure/database/PrismaTipsterRepository'
import { getAuthenticatedTipsterId } from '../auth/session'

const bankDetailsSchema = z.object({
  pixType: z.string().max(40).optional(),
  pixKey: z.string().max(200).optional(),
  bank: z.string().max(80).optional(),
  agency: z.string().max(20).optional(),
  account: z.string().max(40).optional(),
  accountType: z.string().max(30).optional(),
  ownerDocument: z.string().max(40).optional(),
})

export async function PATCH(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = bankDetailsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Dados bancários inválidos.' }, { status: 400 })

  const result = await new AtualizarDadosBancariosUseCase(new PrismaTipsterRepository()).execute({
    tipsterId,
    bankDetails: parsed.data,
  })

  return NextResponse.json({ tipster: result })
}
