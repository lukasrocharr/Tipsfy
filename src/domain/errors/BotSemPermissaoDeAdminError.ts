/**
 * Erro de domínio para bots que conseguem acessar o chat, mas não administrá-lo.
 * A mensagem específica é preservada pela API para orientar o tipster na interface.
 */
export class BotSemPermissaoDeAdminError extends Error {
  constructor() {
    super('O bot precisa ser administrador do canal para continuar.')
    this.name = 'BotSemPermissaoDeAdminError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
