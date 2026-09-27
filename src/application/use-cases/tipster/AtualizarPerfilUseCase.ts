import type { TipsterRepository } from '../../ports/TipsterRepository'
import { Tipster } from '../../../domain/entities/Tipster'

export type AtualizarPerfilInput = {
  tipsterId: string
  name?: string
  email?: string
  bio?: string
  website?: string
  profilePhotoUrl?: string | null
}

export class AtualizarPerfilUseCase {
  constructor(private readonly repository: TipsterRepository) {}

  async execute(input: AtualizarPerfilInput): Promise<Tipster> {
    const current = await this.repository.buscarPorId(input.tipsterId)
    if (!current) throw new Error('Tipster não encontrado.')

    const next = new Tipster(
      current.id,
      input.email?.trim().toLowerCase() || current.email,
      current.passwordHash,
      current.planTier,
      current.trialEndsAt,
      input.name ?? current.name,
      input.bio ?? current.bio,
      input.website ?? current.website,
      current.notificationPreferences,
      current.bankDetails,
      current.deletedAt,
      current.deletionReason,
      input.profilePhotoUrl === undefined
        ? current.profilePhotoUrl
        : input.profilePhotoUrl || null,
    )

    if (this.repository.atualizar) await this.repository.atualizar(next)
    return next
  }
}
