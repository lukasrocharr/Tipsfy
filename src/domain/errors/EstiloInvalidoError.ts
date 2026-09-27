export class EstiloInvalidoError extends Error {
  constructor(referenceType: string, invalidId: string) {
    super(`Referência de estilo inválida para ${referenceType}: ${invalidId}.`)
    this.name = 'EstiloInvalidoError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}