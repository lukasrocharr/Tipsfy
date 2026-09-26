/**
 * Entidade de cobrança associada a uma assinatura.
 * gatewayTxId é a chave de idempotência recebida do gateway nos webhooks.
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'
export type PaymentMethod = 'pix' | 'credit_card'

export class Payment {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,
    public readonly amount: number,
    public readonly method: PaymentMethod,
    public readonly status: PaymentStatus,
    public readonly gatewayTxId: string | null = null,
    public readonly pixQrCode: string | null = null,
    public readonly checkoutUrl: string | null = null,
  ) {}
}