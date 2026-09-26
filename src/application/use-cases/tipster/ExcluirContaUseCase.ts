import type { TipsterRepository } from '../../ports/TipsterRepository'
import { Tipster } from '../../../domain/entities/Tipster'

export type ExcluirContaInput = {
  tipsterId: string
  reason?: string
}

export class ExcluirContaUseCase {
  constructor(private readonly repository: TipsterRepository) {}

  async execute(input: ExcluirContaInput): Promise<Tipster> {
    const current = await this.repository.buscarPorId(input.tipsterId)
    if (!current) throw new Error('Tipster não encontrado.')

    // Soft delete: preserva o histórico para auditoria e possível recuperação, enquanto a conta
    // deixa de funcionar em produção. Isso também dá margem para cancelar assinaturas ativas,
    // remover bots conectados e encerrar integrações sem perder evidências imediatas.
    const next = new Tipster(
      current.id,
      current.email,
      current.passwordHash,
      current.planTier,
      current.trialEndsAt,
      current.name,
      current.bio,
      current.website,
      current.notificationPreferences,
      current.bankDetails,
      new Date(),
      input.reason ?? 'Solicitação do usuário',
    )

    if (this.repository.atualizar) await this.repository.atualizar(next)
    return next
  }
}
