import type { TipsterRepository } from '../../ports/TipsterRepository'
import { Tipster, type BankDetails } from '../../../domain/entities/Tipster'

export type AtualizarDadosBancariosInput = {
  tipsterId: string
  bankDetails: BankDetails
}

export class AtualizarDadosBancariosUseCase {
  constructor(private readonly repository: TipsterRepository) {}

  async execute(input: AtualizarDadosBancariosInput): Promise<Tipster> {
    const current = await this.repository.buscarPorId(input.tipsterId)
    if (!current) throw new Error('Tipster não encontrado.')

    // Fluxo financeiro do tipster: aqui ficam os dados de saque e repasse do próprio criador
    // do canal. Isso é diferente do pagamento do assinante, que entra no fluxo de checkout/
    // subscription e é processado pelo gateway para a cobrança do plano.
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
      input.bankDetails,
      current.deletedAt,
      current.deletionReason,
    )

    if (this.repository.atualizar) await this.repository.atualizar(next)
    return next
  }
}
