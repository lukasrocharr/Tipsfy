import { describe, expect, it, vi } from 'vitest'
import { ConfirmarPagamentoUseCase } from '../../src/application/use-cases/checkout/ConfirmarPagamentoUseCase'
import { IniciarCheckoutUseCase } from '../../src/application/use-cases/checkout/IniciarCheckoutUseCase'
import type { PaymentGateway } from '../../src/application/ports/PaymentGateway'
import type { PaymentRepository } from '../../src/application/ports/PaymentRepository'
import type { PlanRepository } from '../../src/application/ports/PlanRepository'
import type { SubscriberRepository } from '../../src/application/ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../src/application/ports/SubscriptionRepository'
import { Payment } from '../../src/domain/entities/Payment'
import { Plan } from '../../src/domain/entities/Plan'
import { Subscriber } from '../../src/domain/entities/Subscriber'
import { Subscription } from '../../src/domain/entities/Subscription'
import { Periodicity } from '../../src/domain/value-objects/Periodicity'
import { WebhookJaProcessadoError } from '../../src/domain/errors/WebhookJaProcessadoError'
import { VincularTelegramUseCase } from '../../src/application/use-cases/subscriptions/VincularTelegramUseCase'
import { TokenDeVinculacaoInvalidoError } from '../../src/domain/errors/TokenDeVinculacaoInvalidoError'
import { LimiteDeAssinantesExcedidoError } from '../../src/domain/errors/LimiteDeAssinantesExcedidoError'
import { CancelarAssinaturaUseCase } from '../../src/application/use-cases/subscriptions/CancelarAssinaturaUseCase'
import { AuditLog } from '../../src/domain/entities/AuditLog'

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
  subscriber: Subscriber | null = null
  async buscarPorEmail(): Promise<Subscriber | null> { return this.subscriber }
  async buscarPorId(): Promise<Subscriber | null> { return this.subscriber }
  async buscarPorLinkToken(token: string): Promise<Subscriber | null> {
    return this.subscriber?.pendingLinkToken === token ? this.subscriber : null
  }
  async salvar(subscriber: Subscriber): Promise<void> { this.subscriber = subscriber }
  async atualizarVinculo(id: string, data: { telegram?: string | null; telegramId?: string | null; pendingLinkToken?: string | null }): Promise<void> {
    if (!this.subscriber || this.subscriber.id !== id) return
    this.subscriber = new Subscriber(
      this.subscriber.id,
      this.subscriber.name,
      data.telegram ?? this.subscriber.telegram,
      data.telegramId ?? this.subscriber.telegramId,
      this.subscriber.email,
      this.subscriber.channelId,
      this.subscriber.subscriptions,
      data.pendingLinkToken === undefined ? this.subscriber.pendingLinkToken : data.pendingLinkToken,
    )
  }
}

class SubscriptionRepositoryFake implements SubscriptionRepository {
  subscription: Subscription | null = null
  subscriptions: Subscription[] = []
  activations = 0

  async salvar(subscription: Subscription): Promise<void> {
    this.subscription = subscription
    this.subscriptions.push(subscription)
  }

  async buscarPorId(id: string): Promise<Subscription | null> {
    const match = this.subscriptions.find(item => item.id === id) ?? this.subscription
    return match && match.id === id ? match : null
  }

  async listarPorCanal(): Promise<Subscription[]> {
    return [...this.subscriptions]
  }

  async listarAtivasVencidas(): Promise<Subscription[]> {
    return this.subscriptions.filter(item => item.status === 'ACTIVE')
  }

  async contarAtivosPorCanal(): Promise<number> {
    return this.subscriptions.filter(item => item.status === 'ACTIVE').length
  }

  async atualizarStatus(id: string, status: Subscription['status']): Promise<void> {
    if (status === 'ACTIVE') this.activations += 1

    const index = this.subscriptions.findIndex(item => item.id === id)
    if (index >= 0) {
      this.subscriptions[index] = new Subscription(id, this.subscriptions[index].subscriberId, this.subscriptions[index].planId, status, this.subscriptions[index].dueDate)
    }

    if (this.subscription?.id === id) {
      this.subscription = new Subscription(id, this.subscription.subscriberId, this.subscription.planId, status, this.subscription.dueDate)
    }
  }
}

class PaymentRepositoryFake implements PaymentRepository {
  payment: Payment | null = null
  async salvar(payment: Payment): Promise<void> { this.payment = payment }
  async buscarPorGatewayTxId(gatewayTxId: string): Promise<Payment | null> { return this.payment?.gatewayTxId === gatewayTxId ? this.payment : null }
  async buscarPorId(): Promise<Payment | null> { return this.payment }
  async atualizarResultado(id: string, status: Payment['status'], gatewayTxId: string): Promise<void> {
    if (this.payment?.id === id) this.payment = new Payment(id, this.payment.subscriptionId, this.payment.amount, this.payment.method, status, gatewayTxId)
  }
}

class PaymentGatewayFake implements PaymentGateway {
  async criarCobrancaPix(): Promise<{ gatewayTxId: string; pixQrCode: string }> { return { gatewayTxId: 'tx-1', pixQrCode: 'pix-code' } }
  async criarCobrancaCartao(): Promise<{ gatewayTxId: string; checkoutUrl: string }> { return { gatewayTxId: 'tx-1', checkoutUrl: 'https://checkout.test' } }
}

describe('IniciarCheckoutUseCase', () => {
  it.each([
    ['monthly', 1],
    ['quarterly', 3],
    ['annual', 12],
  ] as const)('calcula dueDate para %s', async (period, months) => {
    const plan = new Plan('plan-1', 'Plano', 39.9, period, true, undefined, 'channel-1', 'plano-1')
    const subscriptions = new SubscriptionRepositoryFake()
    const before = new Date()
    const subscriberRepository = new SubscriberRepositoryFake()
    const result = await new IniciarCheckoutUseCase(new PlanRepositoryFake(plan), subscriberRepository, subscriptions, new PaymentRepositoryFake(), new PaymentGatewayFake()).execute({ planSlug: 'plano-1', name: 'Ana', email: 'ana@example.com', paymentMethod: 'pix' })
    const expected = new Periodicity(period).proximaDataDeVencimento(before)
    expect(subscriptions.subscription?.dueDate.getTime()).toBeGreaterThanOrEqual(expected.getTime() - 1000)
    expect(subscriptions.subscription?.dueDate.getTime()).toBeLessThanOrEqual(expected.getTime() + 1000)
    expect(subscriptions.subscription?.dueDate.getMonth()).toBe(expected.getMonth())
    expect(result.deepLinkUrl).toContain('t.me')
    expect(subscriberRepository.subscriber?.pendingLinkToken).not.toBeNull()
    expect(months).toBeGreaterThan(0)
  })

  it('vincula o Telegram usando o token pendente do deep link', async () => {
    const repository = new SubscriberRepositoryFake()
    const subscriber = new Subscriber('s-1', 'Ana', null, null, 'ana@example.com', 'channel-1', [], 'token-vinculacao-123')
    repository.subscriber = subscriber

    await new VincularTelegramUseCase(repository).execute({ linkToken: 'token-vinculacao-123', telegramUserId: '999', telegramUsername: '@ana' })

    expect(repository.subscriber?.telegram).toBe('@ana')
    expect(repository.subscriber?.telegramId).toBe('999')
    expect(repository.subscriber?.pendingLinkToken).toBeNull()
  })

  it('rejeita token de vinculação inválido', async () => {
    const repository = new SubscriberRepositoryFake()
    const promise = new VincularTelegramUseCase(repository).execute({ linkToken: 'token-errado', telegramUserId: '999', telegramUsername: '@ana' })
    try {
      await promise
    } catch (error) {
      console.log('token instanceof', error instanceof TokenDeVinculacaoInvalidoError, Object.getPrototypeOf(error as Error) === TokenDeVinculacaoInvalidoError.prototype)
    }
    await expect(promise).rejects.toBeInstanceOf(TokenDeVinculacaoInvalidoError)
  })

  it('bloqueia a criação do 301º assinante ativo em canal Starter', async () => {
    const plan = new Plan('plan-1', 'Starter Mensal', 39.9, 'monthly', true, 'starter', 'channel-1', 'starter-plan')
    const subscriptionRepository = new SubscriptionRepositoryFake()
    for (let i = 0; i < 300; i++) {
      const sub = new Subscription(`sub-${i}`, `subscriber-${i}`, 'plan-1', 'ACTIVE', new Date())
      subscriptionRepository.subscriptions.push(sub)
      subscriptionRepository.subscription = sub
      await subscriptionRepository.atualizarStatus(sub.id, 'ACTIVE')
    }
    const channelRepository = { buscarPorId: async () => ({ id: 'channel-1', tipsterId: 'tipster-1', telegramChatId: 'chat-1', name: 'Starter', botTokenEnc: null }), listarPorTipsterId: async () => [] }
    const tipsterRepository = { buscarPorId: async () => ({ id: 'tipster-1', email: 'tipster@example.com', passwordHash: 'hash', planTier: 'STARTER', trialEndsAt: new Date() }), salvar: async () => {}, buscarPorEmail: async () => null, existeEmail: async () => false }

    const promise = new IniciarCheckoutUseCase(
      new PlanRepositoryFake(plan),
      new SubscriberRepositoryFake(),
      subscriptionRepository,
      new PaymentRepositoryFake(),
      new PaymentGatewayFake(),
      channelRepository as any,
      tipsterRepository as any,
    ).execute({ planSlug: 'starter-plan', name: 'Assinante 301', email: 'associado301@example.com', paymentMethod: 'pix' })

    try {
      await promise
    } catch (error) {
      console.log('limit instanceof', error instanceof LimiteDeAssinantesExcedidoError, Object.getPrototypeOf(error as Error) === LimiteDeAssinantesExcedidoError.prototype)
    }

    await expect(promise).rejects.toBeInstanceOf(LimiteDeAssinantesExcedidoError)
  })
})

describe('CancelarAssinaturaUseCase', () => {
  it('cancela a assinatura, remove o acesso e registra o audit log', async () => {
    const subscriptionRepository = new SubscriptionRepositoryFake()
    const auditLogRepository = { salvar: vi.fn(async () => {}) }
    const removerAcessoUseCase = { execute: vi.fn(async () => {}) }
    const subscription = new Subscription('sub-1', 'subscriber-1', 'plan-1', 'ACTIVE', new Date())
    subscriptionRepository.subscription = subscription
    subscriptionRepository.atualizarStatus = vi.fn(async (id: string, status: Subscription['status']) => {
      if (subscriptionRepository.subscription?.id === id) {
        subscriptionRepository.subscription = new Subscription(id, subscriptionRepository.subscription.subscriberId, subscriptionRepository.subscription.planId, status, subscriptionRepository.subscription.dueDate)
      }
    }) as any

    await new CancelarAssinaturaUseCase(subscriptionRepository as any, removerAcessoUseCase as any, auditLogRepository as any).execute('sub-1')

    expect(removerAcessoUseCase.execute).toHaveBeenCalledWith(subscription)
    expect(auditLogRepository.salvar).toHaveBeenCalledTimes(1)
    expect(subscriptionRepository.subscription?.status).toBe('CANCELLED')
  })
})

describe('ConfirmarPagamentoUseCase', () => {
  it('não duplica a ativação ao reprocessar gatewayTxId', async () => {
    const paymentRepository = new PaymentRepositoryFake()
    const subscriptionRepository = new SubscriptionRepositoryFake()
    paymentRepository.payment = new Payment('payment-1', 'subscription-1', 39.9, 'pix', 'PENDING', 'tx-1')
    subscriptionRepository.subscription = new Subscription('subscription-1', 'subscriber-1', 'plan-1', 'PENDING', new Date())
    const useCase = new ConfirmarPagamentoUseCase(paymentRepository, subscriptionRepository)

    await useCase.execute({ gatewayTxId: 'tx-1', status: 'PAID' })
    const promise = useCase.execute({ gatewayTxId: 'tx-1', status: 'PAID' })
    try {
      await promise
    } catch (error) {
      console.log('payment instanceof', error instanceof WebhookJaProcessadoError, Object.getPrototypeOf(error as Error) === WebhookJaProcessadoError.prototype)
    }
    await expect(promise).rejects.toBeInstanceOf(WebhookJaProcessadoError)
    expect(subscriptionRepository.activations).toBe(1)
  })
})
