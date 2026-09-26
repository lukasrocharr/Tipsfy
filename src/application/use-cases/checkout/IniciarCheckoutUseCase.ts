/**
 * Caso de uso público que inicia uma assinatura sem criar conta para o assinante.
 * A cobrança nasce PENDING e só a confirmação posterior do gateway ativa a assinatura.
 */
import { randomUUID } from 'node:crypto'
import { Periodicity } from '../../../domain/value-objects/Periodicity'
import { Payment, type PaymentMethod } from '../../../domain/entities/Payment'
import { Subscriber } from '../../../domain/entities/Subscriber'
import { Subscription } from '../../../domain/entities/Subscription'
import type { PaymentGateway } from '../../ports/PaymentGateway'
import type { PaymentRepository } from '../../ports/PaymentRepository'
import type { PlanRepository } from '../../ports/PlanRepository'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'
import { LimiteDeAssinantesExcedidoError } from '../../../domain/errors/LimiteDeAssinantesExcedidoError'

export type IniciarCheckoutInput = { planSlug: string; name: string; email: string; telegramUserId?: string; paymentMethod: PaymentMethod }
export type IniciarCheckoutOutput = { paymentId: string; subscriptionId: string; status: 'PENDING'; pixQrCode: string | null; checkoutUrl: string | null; deepLinkUrl: string | null }

export class IniciarCheckoutUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly subscriberRepository: SubscriberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: IniciarCheckoutInput): Promise<IniciarCheckoutOutput> {
    const plan = await this.planRepository.buscarPorCheckoutSlug(input.planSlug)
    if (!plan || !plan.active) throw new Error('Plano não encontrado.')
    const activeSubscribersInChannel = await this.subscriptionRepository.contarAtivosPorCanal(plan.channelId)
    if (plan.name.toLowerCase().includes('starter') && activeSubscribersInChannel >= 300) {
      throw new LimiteDeAssinantesExcedidoError()
    }
    const subscriber = await this.obterOuCriarSubscriber(input, plan.channelId)
    const dueDate = new Periodicity(plan.period).proximaDataDeVencimento(new Date())
    const subscription = new Subscription(randomUUID(), subscriber.id, plan.id, 'PENDING', dueDate)
    await this.subscriptionRepository.salvar(subscription)
    const payment = new Payment(randomUUID(), subscription.id, plan.price, input.paymentMethod, 'PENDING')
    await this.paymentRepository.salvar(payment)
    const gatewayInput = { paymentId: payment.id, amount: plan.price, email: input.email, description: plan.name, method: input.paymentMethod }
    const gatewayResult = input.paymentMethod === 'pix'
      ? await this.paymentGateway.criarCobrancaPix(gatewayInput)
      : await this.paymentGateway.criarCobrancaCartao(gatewayInput)
    await this.paymentRepository.atualizarResultado(payment.id, 'PENDING', gatewayResult.gatewayTxId)

    const deepLinkToken = subscriber.pendingLinkToken ?? randomUUID().replace(/-/g, '').slice(0, 32)
    if (!subscriber.pendingLinkToken) {
      await this.subscriberRepository.atualizarVinculo(subscriber.id, { pendingLinkToken: deepLinkToken })
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'TipsfyBot'
    const deepLinkUrl = `https://t.me/${botUsername}?start=${deepLinkToken}`
    return { paymentId: payment.id, subscriptionId: subscription.id, status: 'PENDING', pixQrCode: gatewayResult.pixQrCode ?? null, checkoutUrl: gatewayResult.checkoutUrl ?? null, deepLinkUrl }
  }

  private async obterOuCriarSubscriber(input: IniciarCheckoutInput, channelId: string): Promise<Subscriber> {
    const existing = await this.subscriberRepository.buscarPorEmail(input.email.toLowerCase(), channelId)
    if (existing) return existing
    const subscriber = new Subscriber(randomUUID(), input.name, input.telegramUserId ?? null, input.telegramUserId ?? null, input.email.toLowerCase(), channelId, [], null)
    await this.subscriberRepository.salvar(subscriber)
    return subscriber
  }
}
