/**
 * Vincula o assinante ao Telegram usando o link temporário enviado no checkout.
 * O token precisa ser único e válido para evitar associação indevida do usuário.
 */
import { randomUUID } from 'node:crypto'
import { TokenDeVinculacaoInvalidoError } from '../../../domain/errors/TokenDeVinculacaoInvalidoError'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'

export type VincularTelegramInput = {
  linkToken: string
  telegramUserId: string
  telegramUsername?: string | null
}

export class VincularTelegramUseCase {
  constructor(private readonly subscriberRepository: SubscriberRepository) {}

  async execute({ linkToken, telegramUserId, telegramUsername }: VincularTelegramInput): Promise<void> {
    const normalizedToken = linkToken.trim()
    if (!normalizedToken || !/^[A-Za-z0-9_-]{16,64}$/.test(normalizedToken)) {
      throw new TokenDeVinculacaoInvalidoError()
    }

    const subscriber = await this.subscriberRepository.buscarPorLinkToken(normalizedToken)
    if (!subscriber) throw new TokenDeVinculacaoInvalidoError()

    await this.subscriberRepository.atualizarVinculo(subscriber.id, {
      telegram: telegramUsername?.trim() || subscriber.telegram || null,
      telegramId: telegramUserId.trim() || subscriber.telegramId,
      pendingLinkToken: null,
    })
  }
}
