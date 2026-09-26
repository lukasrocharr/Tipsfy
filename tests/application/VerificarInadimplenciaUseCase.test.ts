import { describe, expect, it } from 'vitest'
import { VerificarInadimplenciaUseCase } from '../../src/application/use-cases/subscriptions/VerificarInadimplenciaUseCase'
import { RemoverAcessoUseCase } from '../../src/application/use-cases/subscriptions/RemoverAcessoUseCase'
import { NotificarVencimentoProximoUseCase } from '../../src/application/use-cases/subscriptions/NotificarVencimentoProximoUseCase'
import type { AuditLogRepository } from '../../src/application/ports/AuditLogRepository'
import type { ChannelRepository } from '../../src/application/ports/ChannelRepository'
import type { PaymentRepository } from '../../src/application/ports/PaymentRepository'
import type { PlanRepository } from '../../src/application/ports/PlanRepository'
import type { SubscriberRepository } from '../../src/application/ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../src/application/ports/SubscriptionRepository'
import type { TelegramClient } from '../../src/application/ports/TelegramClient'
import type { CriptografiaService } from '../../src/application/ports/CriptografiaService'
import type { PaymentGateway } from '../../src/application/ports/PaymentGateway'
import { AuditLog } from '../../src/domain/entities/AuditLog'
import { Channel } from '../../src/domain/entities/Channel'
import { Payment } from '../../src/domain/entities/Payment'
import { Plan } from '../../src/domain/entities/Plan'
import { Subscriber } from '../../src/domain/entities/Subscriber'
import { Subscription } from '../../src/domain/entities/Subscription'

class SubscriptionRepositoryFake implements SubscriptionRepository {
  constructor(public subscriptions: Subscription[] = []) {}
  listarAtivasVencidas(agora: Date, toleranceDays: number): Promise<Subscription[]> {
    const cutoff = new Date(agora.getTime() - toleranceDays * 24 * 60 * 60 * 1000)
    return Promise.resolve(this.subscriptions.filter(sub => sub.status === 'ACTIVE' && sub.dueDate.getTime() < cutoff.getTime()))
  }
  listarAtivasProximasDoVencimento(agora: Date, daysAhead: number): Promise<Subscription[]> {
    const cutoff = new Date(agora.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    return Promise.resolve(this.subscriptions.filter(sub => sub.status === 'ACTIVE' && sub.dueDate.getTime() > agora.getTime() && sub.dueDate.getTime() <= cutoff.getTime()))
  }
  async salvar(): Promise<void> {}
  async atualizarStatus(id: string, status: Subscription['status']): Promise<void> {
    const subscription = this.subscriptions.find(item => item.id === id)
    if (!subscription) return
    const index = this.subscriptions.findIndex(item => item.id === id)
    this.subscriptions[index] = new Subscription(id, subscription.subscriberId, subscription.planId, status, subscription.dueDate)
  }
  async buscarPorId(id: string): Promise<Subscription | null> { return this.subscriptions.find(item => item.id === id) ?? null }
  async listarPorCanal(): Promise<Subscription[]> { return [] }
  async contarAtivosPorCanal(): Promise<number> { return 0 }
}

class PaymentRepositoryFake implements PaymentRepository {
  constructor(private readonly payments: Payment[] = []) {}
  async salvar(): Promise<void> {}
  async buscarPorGatewayTxId(): Promise<Payment | null> { return null }
  async buscarPorId(): Promise<Payment | null> { return null }
  async atualizarResultado(): Promise<void> {}
  async buscarUltimoPorSubscriptionId(subscriptionId: string): Promise<Payment | null> {
    return this.payments.filter(payment => payment.subscriptionId === subscriptionId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
  }
}

class PaymentGatewayFake implements PaymentGateway {
  constructor(private readonly shouldFail: boolean) {}
  async criarCobrancaPix(): Promise<{ gatewayTxId: string; pixQrCode: string }> {
    if (this.shouldFail) throw new Error('gateway timeout')
    return { gatewayTxId: 'new-tx', pixQrCode: 'pix-code' }
  }
  async criarCobrancaCartao(): Promise<{ gatewayTxId: string; checkoutUrl: string }> {
    if (this.shouldFail) throw new Error('gateway timeout')
    return { gatewayTxId: 'new-tx', checkoutUrl: 'https://checkout.test' }
  }
}

class ChannelRepositoryFake implements ChannelRepository {
  constructor(private readonly channel: Channel) {}
  async salvar(): Promise<void> {}
  async buscarPorId(): Promise<Channel | null> { return this.channel }
  async listarPorTipsterId(): Promise<Channel[]> { return [this.channel] }
  async atualizarBotToken(): Promise<void> {}
}

class PlanRepositoryFake implements PlanRepository {
  constructor(private readonly plan: Plan) {}
  async salvar(): Promise<void> {}
  async atualizar(): Promise<void> {}
  async buscarPorId(): Promise<Plan | null> { return this.plan }
  async buscarPorCheckoutSlug(): Promise<Plan | null> { return this.plan }
  async listarPorChannelId(): Promise<Plan[]> { return [this.plan] }
  async existeCheckoutSlug(): Promise<boolean> { return false }
  async remover(): Promise<void> {}
}

class SubscriberRepositoryFake implements SubscriberRepository {
  constructor(private readonly subscriber: Subscriber) {}
  async buscarPorEmail(): Promise<Subscriber | null> { return this.subscriber }
  async salvar(): Promise<void> {}
  async buscarPorId(): Promise<Subscriber | null> { return this.subscriber }
}

class CriptografiaFake implements CriptografiaService {
  criptografar(value: string): string { return `encrypted:${value}` }
  descriptografar(value: string): string { return value.replace('encrypted:', '') }
}

class TelegramClientFake implements TelegramClient {
  removerMembroCalls: Array<{ token: string; chatId: string; userId: string }> = []
  privateMessageCalls: Array<{ token: string; chatId: string; texto: string }> = []
  async validarAcessoDoBot(): Promise<void> {}
  async criarConviteDeUsoUnico(): Promise<string> { return 'https://t.me/invite/test' }
  async removerMembro(token: string, chatId: string, userId: string): Promise<void> {
    this.removerMembroCalls.push({ token, chatId, userId })
  }
  async enviarMensagemAoCanal(): Promise<void> {}
  async enviarMensagemPrivada(token: string, chatId: string, texto: string): Promise<void> {
    this.privateMessageCalls.push({ token, chatId, texto })
  }
}

class AuditLogRepositoryFake implements AuditLogRepository {
  logs: AuditLog[] = []
  async salvar(log: AuditLog): Promise<void> { this.logs.push(log) }
}

describe('VerificarInadimplenciaUseCase', () => {
  it('muda para PAST_DUE e remove o acesso quando a tolerância expirou', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription = new Subscription('sub-1', 'subscriber-1', 'plan-1', 'ACTIVE', new Date('2026-09-10T00:00:00.000Z'))
    const plan = new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1')
    const subscriber = new Subscriber('subscriber-1', 'Ana', '@ana', '12345', 'ana@example.com', 'channel-1')
    const channel = new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal')
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription])
    const paymentRepository = new PaymentRepositoryFake([
      new Payment('payment-1', 'sub-1', 79, 'pix', 'PAID', 'tx-1', null, null),
    ])
    const paymentGateway = new PaymentGatewayFake(true)
    const telegramClient = new TelegramClientFake()
    const auditLogRepository = new AuditLogRepositoryFake()
    const removerAcesso = new RemoverAcessoUseCase(subscriptionRepository, new SubscriberRepositoryFake(subscriber), new PlanRepositoryFake(plan), new ChannelRepositoryFake(channel), new CriptografiaFake(), telegramClient)
    const useCase = new VerificarInadimplenciaUseCase(subscriptionRepository, paymentRepository, paymentGateway, removerAcesso, auditLogRepository, 3)

    await useCase.execute(now)

    expect(subscriptionRepository.subscriptions[0].status).toBe('PAST_DUE')
    expect(telegramClient.removerMembroCalls).toHaveLength(1)
    expect(telegramClient.removerMembroCalls[0]).toEqual({ token: 'token-123', chatId: '@canal', userId: '12345' })
    expect(auditLogRepository.logs.some(log => log.action === 'subscription.overdue' && log.details.includes('tolerância') && log.details.includes('removido'))).toBe(true)
  })

  it('não faz nenhuma ação quando a assinatura ainda está dentro da tolerância', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription = new Subscription('sub-2', 'subscriber-2', 'plan-1', 'ACTIVE', new Date('2026-09-24T12:00:00.000Z'))
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription])
    const paymentRepository = new PaymentRepositoryFake([])
    const paymentGateway = new PaymentGatewayFake(false)
    const auditLogRepository = new AuditLogRepositoryFake()
    const telegramClient = new TelegramClientFake()
    const removable = new RemoverAcessoUseCase(subscriptionRepository, new SubscriberRepositoryFake(new Subscriber('subscriber-2', 'Bia', '@bia', '999', 'bia@example.com', 'channel-1')), new PlanRepositoryFake(new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1')), new ChannelRepositoryFake(new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal')), new CriptografiaFake(), telegramClient)
    const useCase = new VerificarInadimplenciaUseCase(subscriptionRepository, paymentRepository, paymentGateway, removable, auditLogRepository, 3)

    await useCase.execute(now)

    expect(subscriptionRepository.subscriptions[0].status).toBe('ACTIVE')
    expect(telegramClient.removerMembroCalls).toHaveLength(0)
    expect(auditLogRepository.logs).toEqual([])
  })

  it('envia aviso de vencimento exatamente 3 dias antes e registra sucesso', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription = new Subscription('sub-3', 'subscriber-3', 'plan-1', 'ACTIVE', new Date('2026-09-28T00:00:00.000Z'))
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription])
    const subscriberRepository = new SubscriberRepositoryFake(new Subscriber('subscriber-3', 'Cleo', '@cleo', '987654', 'cleo@example.com', 'channel-1'))
    const planRepository = new PlanRepositoryFake(new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1'))
    const channelRepository = new ChannelRepositoryFake(new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal'))
    const auditLogRepository = new AuditLogRepositoryFake()
    const telegramClient = new TelegramClientFake()

    const useCase = new NotificarVencimentoProximoUseCase(
      subscriptionRepository,
      subscriberRepository,
      planRepository,
      channelRepository,
      new CriptografiaFake(),
      telegramClient,
      auditLogRepository,
    )

    await useCase.execute(now)

    expect(telegramClient.privateMessageCalls).toHaveLength(1)
    expect(auditLogRepository.logs.some(log => log.action === 'subscription.expiring.sent')).toBe(true)
  })

  it('não envia quando a assinatura vence em 2 dias ou 4 dias', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription2 = new Subscription('sub-4', 'subscriber-4', 'plan-1', 'ACTIVE', new Date('2026-09-27T00:00:00.000Z'))
    const subscription4 = new Subscription('sub-5', 'subscriber-5', 'plan-1', 'ACTIVE', new Date('2026-09-29T00:00:00.000Z'))
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription2, subscription4])
    const subscriberRepository = new SubscriberRepositoryFake(new Subscriber('subscriber-4', 'Dani', '@dani', '111', 'dani@example.com', 'channel-1'))
    const planRepository = new PlanRepositoryFake(new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1'))
    const channelRepository = new ChannelRepositoryFake(new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal'))
    const auditLogRepository = new AuditLogRepositoryFake()
    const telegramClient = new TelegramClientFake()

    const useCase = new NotificarVencimentoProximoUseCase(
      subscriptionRepository,
      subscriberRepository,
      planRepository,
      channelRepository,
      new CriptografiaFake(),
      telegramClient,
      auditLogRepository,
    )

    await useCase.execute(now)

    expect(telegramClient.privateMessageCalls).toHaveLength(0)
    expect(auditLogRepository.logs).toEqual([])
  })

  it('ignora subscriber sem telegramUserId vinculado e registra motivo explícito', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription = new Subscription('sub-6', 'subscriber-6', 'plan-1', 'ACTIVE', new Date('2026-09-28T00:00:00.000Z'))
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription])
    const subscriberRepository = new SubscriberRepositoryFake(new Subscriber('subscriber-6', 'Eva', '@eva', null, 'eva@example.com', 'channel-1'))
    const planRepository = new PlanRepositoryFake(new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1'))
    const channelRepository = new ChannelRepositoryFake(new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal'))
    const auditLogRepository = new AuditLogRepositoryFake()
    const telegramClient = new TelegramClientFake()

    const useCase = new NotificarVencimentoProximoUseCase(
      subscriptionRepository,
      subscriberRepository,
      planRepository,
      channelRepository,
      new CriptografiaFake(),
      telegramClient,
      auditLogRepository,
    )

    await useCase.execute(now)

    expect(telegramClient.privateMessageCalls).toHaveLength(0)
    expect(auditLogRepository.logs.some(log => log.action === 'subscription.expiring.missingTelegramId' && log.details.includes('telegramUserId não vinculado'))).toBe(true)
  })

  it('registra falha de envio sem interromper o lote', async () => {
    const now = new Date('2026-09-25T12:00:00.000Z')
    const subscription = new Subscription('sub-7', 'subscriber-7', 'plan-1', 'ACTIVE', new Date('2026-09-28T00:00:00.000Z'))
    const subscriptionRepository = new SubscriptionRepositoryFake([subscription])
    const subscriberRepository = new SubscriberRepositoryFake(new Subscriber('subscriber-7', 'Fábio', '@fabio', '222', 'fabio@example.com', 'channel-1'))
    const planRepository = new PlanRepositoryFake(new Plan('plan-1', 'Plano Pro', 79, 'monthly', true, 'desc', 'channel-1', 'slug-1'))
    const channelRepository = new ChannelRepositoryFake(new Channel('channel-1', 'tipster-1', '@canal', 'encrypted:token-123', 'Canal'))
    const auditLogRepository = new AuditLogRepositoryFake()
    const telegramClient: TelegramClient = {
      validarAcessoDoBot: async () => {},
      registrarWebhook: async () => {},
      criarConviteDeUsoUnico: async () => 'https://t.me/invite/test',
      removerMembro: async () => {},
      enviarMensagemAoCanal: async () => {},
      enviarMensagemPrivada: async () => {
        throw new Error('token de bot inválido')
      },
    }

    const useCase = new NotificarVencimentoProximoUseCase(
      subscriptionRepository,
      subscriberRepository,
      planRepository,
      channelRepository,
      new CriptografiaFake(),
      telegramClient,
      auditLogRepository,
    )

    await useCase.execute(now)

    expect(auditLogRepository.logs.some(log => log.action === 'subscription.expiring.failed' && log.details.includes('token de bot inválido'))).toBe(true)
  })
})
