import type { TipsterRepository } from '../../ports/TipsterRepository'
import { Tipster, type NotificationPreferences } from '../../../domain/entities/Tipster'

export type AtualizarPreferenciasDeNotificacaoInput = {
  tipsterId: string
  preferences: NotificationPreferences
}

export class AtualizarPreferenciasDeNotificacaoUseCase {
  constructor(private readonly repository: TipsterRepository) {}

  async execute(input: AtualizarPreferenciasDeNotificacaoInput): Promise<Tipster> {
    const current = await this.repository.buscarPorId(input.tipsterId)
    if (!current) throw new Error('Tipster não encontrado.')

    const next = new Tipster(
      current.id,
      current.email,
      current.passwordHash,
      current.planTier,
      current.trialEndsAt,
      current.name,
      current.bio,
      current.website,
      input.preferences,
      current.bankDetails,
      current.deletedAt,
      current.deletionReason,
    )

    if (this.repository.atualizar) await this.repository.atualizar(next)
    return next
  }
}
