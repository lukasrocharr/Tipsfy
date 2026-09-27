import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaPaymentRepository } from '@/infrastructure/database/PrismaPaymentRepository'

const paymentIdSchema = z.string().uuid()

export async function GET(_request: Request, context: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await context.params
  const parsed = paymentIdSchema.safeParse(paymentId)
  if (!parsed.success) return NextResponse.json({ message: 'Pagamento não encontrado.' }, { status: 404 })

  const payment = await new PrismaPaymentRepository().buscarPorId(parsed.data)
  if (!payment) return NextResponse.json({ message: 'Pagamento não encontrado.' }, { status: 404 })
  return NextResponse.json({ status: payment.status })
}