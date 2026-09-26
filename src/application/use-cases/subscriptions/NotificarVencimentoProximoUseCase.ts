import type { AuditLogRepository } from '../../ports/AuditLogRepository'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { PlanRepository } from '../../ports/PlanRepository'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import type { TelegramClient } from '../../ports/TelegramClient'
import type { CriptografiaService } from '../../ports/CriptografiaService'
import { AuditLog } from '../../../domain/entities/AuditLog'
import { MensagemDeVencimento } from '../../../domain/value-objects/MensagemDeVencimento'

/**
 * Aviso de renovação para assinaturas ativas cujo vencimento está exatamente 3 dias no futuro.
 * A constante abaixo foi deixada em domínio para permitir futura configuração sem espalhar mágicos.
 */
export const DIAS_DE_ANTECEDENCIA_AVISO_VENCIMENTO = 3

export class NotificarVencimentoProximoUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriberRepository: SubscriberRepository,
    private readonly planRepository: PlanRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly criptografiaService: CriptografiaService,
    private readonly telegramClient: TelegramClient,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(agora: Date = new Date()): Promise<void> {
    const subscriptions = await this.subscriptionRepository.listarAtivasProximasDoVencimento?.(agora, DIAS_DE_ANTECEDENCIA_AVISO_VENCIMENTO) ?? []

    for (const subscription of subscriptions) {
      const diffMs = subscription.dueDate.getTime() - agora.getTime()
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
      if (diffDays !== DIAS_DE_ANTECEDENCIA_AVISO_VENCIMENTO) continue

      const [subscriber, plan, channel] = await Promise.all([
        this.subscriberRepository.buscarPorId?.(subscription.subscriberId) ?? null,
        this.planRepository.buscarPorId(subscription.planId),
        this.channelRepository.buscarPorId((await this.planRepository.buscarPorId(subscription.planId))?.channelId ?? ''),
      ])

      if (!subscriber || !plan || !channel) continue

      if (!subscriber.telegramId) {
        await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.expiring.missingTelegramId', `Assinatura ativa próxima do vencimento, mas o assinante ${subscriber.email} tem telegramUserId não vinculado.`))
        continue
      }

      const botToken = channel.botTokenEnc ? this.criptografiaService.descriptografar(channel.botTokenEnc) : null
      if (!botToken) {
        await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.expiring.missingBotToken', `Assinatura ativa próxima do vencimento, mas o canal ${channel.id} não possui bot configurado para avisar.`))
        continue
      }

      try {
        const mensagem = MensagemDeVencimento.criar({
          subscriberName: subscriber.name,
          planName: plan.name,
          dueDate: subscription.dueDate,
        })
        await this.telegramClient.enviarMensagemPrivada(botToken, subscriber.telegramId, mensagem.texto)
        await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.expiring.sent', `Aviso de vencimento enviado para ${subscriber.email} com 3 dias de antecedência.`))
      } catch (error) {
        await this.auditLogRepository.salvar(new AuditLog(subscription.id, 'subscription.expiring.failed', `Falha ao enviar aviso de vencimento para ${subscriber.email}: ${error instanceof Error ? error.message : 'erro desconhecido'}`))
      }
    }
  }
}
