/**
 * Remove o acesso do assinante ao canal quando a assinatura fica inadimplente.
 * O caso de uso centraliza a dependência de Telegram para que o restante do sistema
 * só saiba que a assinatura foi cancelada, sem conhecer a API do bot.
 */
import { randomUUID } from 'node:crypto'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { PlanRepository } from '../../ports/PlanRepository'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import type { TelegramClient } from '../../ports/TelegramClient'
import type { CriptografiaService } from '../../ports/CriptografiaService'
import { Subscription } from '../../../domain/entities/Subscription'

export class RemoverAcessoUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriberRepository: SubscriberRepository,
    private readonly planRepository: PlanRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly criptografiaService: CriptografiaService,
    private readonly telegramClient: TelegramClient,
  ) {}

  async execute(subscription: Subscription): Promise<void> {
    const [subscriber, plan, channel] = await Promise.all([
      this.subscriberRepository.buscarPorId?.(subscription.subscriberId) ?? null,
      this.planRepository.buscarPorId(subscription.planId),
      this.channelRepository.buscarPorId((await this.planRepository.buscarPorId(subscription.planId))?.channelId ?? ''),
    ])

    if (!subscriber || !plan || !channel) return
    const botToken = channel.botTokenEnc ? this.criptografiaService.descriptografar(channel.botTokenEnc) : null
    if (!botToken || !subscriber.telegramId) return

    await this.telegramClient.removerMembro(botToken, channel.telegramChatId, subscriber.telegramId)
    await this.subscriptionRepository.atualizarStatus(subscription.id, 'PAST_DUE' as Subscription['status'])
  }
}
