import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PagamentoNaoEncontradoError } from '../../../domain/errors/PagamentoNaoEncontradoError'
import { WebhookJaProcessadoError } from '../../../domain/errors/WebhookJaProcessadoError'
import { checkoutUseCasesFactory } from '../../../infrastructure/factories/checkoutUseCaseFactory'
import { validarAssinaturaMercadoPago } from './mercadoPagoSignature'

const webhookSchema = z.object({ gatewayTxId: z.string().min(1), status: z.enum(['PAID', 'FAILED']) })

export async function POST(request: Request) {
  const rawBody = await request.text()
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ message: 'Payload inválido.' }, { status: 400 })
  }
  if (!validarAssinaturaMercadoPago(rawBody, request.headers.get('x-signature'), request.headers.get('x-request-id'))) {
    return NextResponse.json({ message: 'Assinatura inválida.' }, { status: 401 })
  }
  const parsed = webhookSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Webhook inválido.' }, { status: 400 })
  try {
    await checkoutUseCasesFactory().confirmar.execute(parsed.data)
    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof WebhookJaProcessadoError) return NextResponse.json({ received: true })
    if (error instanceof PagamentoNaoEncontradoError) return NextResponse.json({ message: error.message }, { status: 404 })
    return NextResponse.json({ message: 'Não foi possível confirmar o pagamento.' }, { status: 500 })
  }
}
