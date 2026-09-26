/**
 * Erro de domínio para impedir que o plano Starter crie mais de um canal.
 * A regra fica fora do handler para ser igual em HTTP, jobs e futuros adaptadores.
 */
export class LimiteDeCanaisExcedidoError extends Error {
  constructor() {
    super('O plano Starter permite apenas um canal.')
    this.name = 'LimiteDeCanaisExcedidoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}