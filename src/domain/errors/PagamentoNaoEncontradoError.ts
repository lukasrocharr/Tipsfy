/**
 * Erro de domínio para webhook que referencia uma cobrança desconhecida.
 */
export class PagamentoNaoEncontradoError extends Error {
  constructor() {
    super('Pagamento não encontrado.')
    this.name = 'PagamentoNaoEncontradoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
