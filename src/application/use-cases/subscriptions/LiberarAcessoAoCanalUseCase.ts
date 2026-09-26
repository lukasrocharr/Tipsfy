/**
 * Libera o acesso ao canal do assinante após a confirmação de pagamento.
 * O caso de uso encapsula a operação de Telegram para que qualquer outro fluxo
 * apenas saiba que a assinatura está ativa e o canal deve estar liberado.
 */
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { CriptografiaService } from '../../ports/CriptografiaService'
import type { PlanRepository } from '../../ports/PlanRepository'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import type { TelegramClient } from '../../ports/TelegramClient'

export class LiberarAcessoAoCanalUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriberRepository: SubscriberRepository,
    private readonly planRepository: PlanRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly criptografiaService: CriptografiaService,
    private readonly telegramClient: TelegramClient,
  ) {}

  async execute(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.buscarPorId(subscriptionId)
    if (!subscription) return

    const plan = await this.planRepository.buscarPorId(subscription.planId)
    if (!plan) return

    const channel = await this.channelRepository.buscarPorId(plan.channelId)
    const subscriber = await this.subscriberRepository.buscarPorId(subscription.subscriberId)
    if (!channel || !subscriber || !subscriber.telegramId || !channel.botTokenEnc) return

    const botToken = this.criptografiaService.descriptografar(channel.botTokenEnc)
    await this.telegramClient.criarConviteDeUsoUnico(botToken, channel.telegramChatId)
  }
}
