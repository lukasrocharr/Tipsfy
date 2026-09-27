export class PaginaJaConfiguradaError extends Error {
  constructor() {
    super(
      "O canal já possui uma página. Confirme explicitamente a substituição antes de aplicar outro template.",
    )
    this.name = "PaginaJaConfiguradaError"
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
