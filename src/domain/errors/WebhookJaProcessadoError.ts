/**
 * Erro usado para sinalizar webhook repetido sem executar a ativação novamente.
 * Gateways reenviam webhooks quando não recebem confirmação rápida da aplicação.
 */
export class WebhookJaProcessadoError extends Error {
  constructor() {
    super('Webhook já processado.')
    this.name = 'WebhookJaProcessadoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
