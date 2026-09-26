import { NextResponse } from 'next/server'
import { ListarTransacoesUseCase } from '../../../../application/use-cases/financials/ListarTransacoesUseCase'
import { PrismaPaymentRepository } from '../../../../infrastructure/database/PrismaPaymentRepository'
import { getAuthenticatedTipsterId } from '../../../../interfaces/http/auth/session'

export async function GET(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const status = new URL(request.url).searchParams.get('status') as 'all' | 'paid' | 'pending' | 'failed' | 'refunded' | null

  const transactions = await new ListarTransacoesUseCase(new PrismaPaymentRepository()).execute({
    tipsterId,
    status: status ?? 'all',
  })

  return NextResponse.json({ transactions })
}
