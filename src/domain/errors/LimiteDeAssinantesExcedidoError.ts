/**
 * Erro de domínio para impedir que um canal Starter ultrapasse o limite de 300
 * assinantes ativos em um único período de faturamento.
 */
export class LimiteDeAssinantesExcedidoError extends Error {
  constructor() {
    super('O canal Starter permite no máximo 300 assinantes ativos.')
    this.name = 'LimiteDeAssinantesExcedidoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
