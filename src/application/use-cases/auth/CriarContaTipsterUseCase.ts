/**
 * Caso de uso de criação da conta inicial do tipster.
 * A janela de trial é aplicada aqui, no centro da aplicação, para que nenhum adaptador
 * HTTP ou repositório replique a regra comercial do PRD.
 */
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { EmailJaCadastradoError } from '../../../domain/errors/EmailJaCadastradoError'
import { Tipster, type PlanTier, type TipsterPublic } from '../../../domain/entities/Tipster'
import type { TipsterRepository } from '../../ports/TipsterRepository'

export const DIAS_DE_TRIAL_GRATUITO = 14
const CUSTO_HASH_BCRYPT = 12

export type CriarContaTipsterInput = { email: string; senha: string }

export class CriarContaTipsterUseCase {
  constructor(private readonly repository: TipsterRepository) {}

  async execute({ email, senha }: CriarContaTipsterInput): Promise<TipsterPublic> {
    const emailNormalizado = email.trim().toLowerCase()
    if (await this.repository.existeEmail(emailNormalizado)) {
      throw new EmailJaCadastradoError()
    }

    const passwordHash = await bcrypt.hash(senha, CUSTO_HASH_BCRYPT)
    const tipster = new Tipster(
      randomUUID(),
      emailNormalizado,
      passwordHash,
      'STARTER' satisfies PlanTier,
      this.calcularFimDoTrial(),
    )

    await this.repository.salvar(tipster)
    return tipster.withoutPassword()
  }

  private calcularFimDoTrial(): Date {
    const trialEndsAt = new Date()
    // PRD comercial: toda conta nova recebe 14 dias de trial gratuito.
    trialEndsAt.setDate(trialEndsAt.getDate() + DIAS_DE_TRIAL_GRATUITO)
    return trialEndsAt
  }
}