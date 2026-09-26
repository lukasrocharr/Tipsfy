export class RecursoNaoDisponivelNoPlanoError extends Error {
  constructor(planTier: 'STARTER' | 'PRO') {
    super(`Este recurso é exclusivo para o plano PRO. Seu plano atual é ${planTier}.`)
    this.name = 'RecursoNaoDisponivelNoPlanoError'
  }
}
