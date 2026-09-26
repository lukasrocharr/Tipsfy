/**
 * Porta de cobrança para manter Mercado Pago substituível por fake ou outro gateway.
 */
import type { PaymentMethod } from '../../domain/entities/Payment'

export type GatewayPaymentResult = { gatewayTxId: string; pixQrCode?: string; checkoutUrl?: string }
export type GatewayPaymentInput = { paymentId: string; amount: number; email: string; description: string; method?: PaymentMethod }

export interface PaymentGateway {
  criarCobrancaPix(input: GatewayPaymentInput): Promise<GatewayPaymentResult>
  criarCobrancaCartao(input: GatewayPaymentInput): Promise<GatewayPaymentResult>
}
