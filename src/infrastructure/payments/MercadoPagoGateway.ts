import type { GatewayPaymentInput, GatewayPaymentResult, GatewayPaymentStatus, PaymentGateway } from '../../application/ports/PaymentGateway'

const MERCADO_PAGO_API = 'https://api.mercadopago.com'

type MercadoPagoResponse = {
  id?: string | number
  init_point?: string
  status?: string
  point_of_interaction?: { transaction_data?: { qr_code?: string } }
}

export class MercadoPagoGateway implements PaymentGateway {
  private readonly accessToken = process.env.MP_ACCESS_TOKEN

  async criarCobrancaPix(input: GatewayPaymentInput): Promise<GatewayPaymentResult> {
    const response = await this.request<MercadoPagoResponse>('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': input.paymentId },
      body: JSON.stringify({
        transaction_amount: input.amount,
        description: input.description,
        payment_method_id: 'pix',
        payer: { email: input.email },
        external_reference: input.paymentId,
      }),
    })
    return { gatewayTxId: String(response.id), pixQrCode: response.point_of_interaction?.transaction_data?.qr_code }
  }

  async consultarStatus(gatewayTxId: string): Promise<GatewayPaymentStatus> {
    const response = await this.request<MercadoPagoResponse>(`/v1/payments/${encodeURIComponent(gatewayTxId)}`, {
      method: 'GET',
    })
    if (response.status === 'approved') return 'PAID'
    if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(response.status ?? '')) return 'FAILED'
    return 'PENDING'
  }

  private async request<T>(path: string, options: RequestInit): Promise<T> {
    if (!this.accessToken) throw new Error('MP_ACCESS_TOKEN não configurado.')
    const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json', ...options.headers },
    })
    if (!response.ok) throw new Error(`Mercado Pago respondeu ${response.status}.`)
    return response.json() as Promise<T>
  }
}
