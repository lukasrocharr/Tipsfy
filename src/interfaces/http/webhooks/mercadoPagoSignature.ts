import { createHmac, timingSafeEqual } from 'node:crypto'

export function validarAssinaturaMercadoPago(rawBody: string, signature: string | null, requestId: string | null, secret = process.env.MERCADOPAGO_WEBHOOK_SECRET): boolean {
  if (!secret || !signature || !requestId) return false
  const values = Object.fromEntries(signature.split(',').map(part => part.split('=').map(value => value.trim())))
  const timestamp = values.ts
  const received = values.v1
  if (!timestamp || !received) return false
  const body = JSON.parse(rawBody) as { data?: { id?: string } }
  const dataId = body.data?.id
  if (!dataId) return false
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  return expected.length === received.length && timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}
