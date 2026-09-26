/**
 * Erro de domínio para uma tentativa de cadastro com e-mail já utilizado.
 * A aplicação trata este erro como conflito, sem expor detalhes da persistência.
 */
export class EmailJaCadastradoError extends Error {
  constructor() {
    super('Já existe uma conta com este e-mail.')
    this.name = 'EmailJaCadastradoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}