/**
 * Porta de cobrança para manter Mercado Pago substituível por fake ou outro gateway.
 */
export type GatewayPaymentResult = { gatewayTxId: string; pixQrCode?: string; checkoutUrl?: string }
export type GatewayPaymentStatus = 'PENDING' | 'PAID' | 'FAILED'
export type GatewayPaymentInput = { paymentId: string; amount: number; email: string; description: string; method?: 'pix' }

export interface PaymentGateway {
  criarCobrancaPix(input: GatewayPaymentInput): Promise<GatewayPaymentResult>
  consultarStatus(gatewayTxId: string): Promise<GatewayPaymentStatus>
}
