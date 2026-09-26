import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ExcluirContaUseCase } from '../../../application/use-cases/tipster/ExcluirContaUseCase'
import { PrismaTipsterRepository } from '../../../infrastructure/database/PrismaTipsterRepository'
import { getAuthenticatedTipsterId } from '../auth/session'

const deleteAccountSchema = z.object({
  reason: z.string().trim().max(300).optional(),
})

export async function DELETE(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = deleteAccountSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Motivo inválido.' }, { status: 400 })

  const result = await new ExcluirContaUseCase(new PrismaTipsterRepository()).execute({
    tipsterId,
    reason: parsed.data.reason,
  })

  return NextResponse.json({
    ok: true,
    deletedAt: result.deletedAt,
    message: 'Conta marcada para exclusão suave. A auditoria e possível recuperação continuam disponíveis.',
  })
}
