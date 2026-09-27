import { afterEach, describe, expect, it, vi } from 'vitest'
import { MercadoPagoGateway } from '../../src/infrastructure/payments/MercadoPagoGateway'

describe('MercadoPagoGateway Pix', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('creates Pix charges and returns the payload from Mercado Pago', async () => {
    vi.stubEnv('MP_ACCESS_TOKEN', 'test-token')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 123,
      point_of_interaction: { transaction_data: { qr_code: 'pix-copy-paste' } },
    }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const gateway = new MercadoPagoGateway()

    await expect(gateway.criarCobrancaPix({
      paymentId: 'payment-1',
      amount: 39.9,
      email: 'subscriber@example.com',
      description: 'Plano mensal',
    })).resolves.toEqual({ gatewayTxId: '123', pixQrCode: 'pix-copy-paste' })

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(String(request.body))).toMatchObject({ payment_method_id: 'pix' })
    expect(JSON.parse(String(request.body))).not.toHaveProperty('token')
  })

  it.each([
    ['approved', 'PAID'],
    ['rejected', 'FAILED'],
    ['cancelled', 'FAILED'],
    ['in_process', 'PENDING'],
  ] as const)('maps Mercado Pago status %s to %s', async (gatewayStatus, expected) => {
    vi.stubEnv('MP_ACCESS_TOKEN', 'test-token')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: gatewayStatus }), { status: 200 })))
    const gateway = new MercadoPagoGateway()

    await expect(gateway.consultarStatus('123')).resolves.toBe(expected)
  })
})