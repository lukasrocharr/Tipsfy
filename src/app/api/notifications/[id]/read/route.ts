import { NextResponse } from 'next/server'
import { MarcarNotificacaoComoLidaUseCase } from '../../../../../application/use-cases/notifications/MarcarNotificacaoComoLidaUseCase'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  if (!id) return NextResponse.json({ message: 'Identificador inválido.' }, { status: 400 })

  const result = new MarcarNotificacaoComoLidaUseCase().execute(id)
  return NextResponse.json({ ok: result })
}
