/**
 * Erro explícito para link de vinculação do Telegram expirado, inválido ou já usado.
 */
export class TokenDeVinculacaoInvalidoError extends Error {
  constructor() {
    super('O token de vinculação do Telegram é inválido ou expirou.')
    this.name = 'TokenDeVinculacaoInvalidoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
