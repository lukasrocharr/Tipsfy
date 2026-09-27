import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { validarAssinaturaMercadoPago } from '../../../src/interfaces/http/webhooks/mercadoPagoSignature'

describe('validarAssinaturaMercadoPago', () => {
  it('validates a Mercado Pago notification containing data.id', () => {
    const secret = 'webhook-test-secret'
    const requestId = 'request-123'
    const timestamp = '1727366400'
    const body = JSON.stringify({ type: 'payment', data: { id: '987654321' } })
    const manifest = `id:987654321;request-id:${requestId};ts:${timestamp};`
    const signature = createHmac('sha256', secret).update(manifest).digest('hex')

    expect(validarAssinaturaMercadoPago(body, `ts=${timestamp},v1=${signature}`, requestId, secret)).toBe(true)
    expect(validarAssinaturaMercadoPago(body, `ts=${timestamp},v1=${signature}`, 'wrong-request', secret)).toBe(false)
  })
})