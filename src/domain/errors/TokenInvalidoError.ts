/**
 * Erro explícito para token Telegram malformado ou rejeitado pelo Bot API.
 */
export class TokenInvalidoError extends Error {
  constructor() {
    super('O token do bot Telegram é inválido.')
    this.name = 'TokenInvalidoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
