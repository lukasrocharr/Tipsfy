import type { PlanRepository } from '../../ports/PlanRepository'
import type { SubscriberRepository } from '../../ports/SubscriberRepository'
import type { SubscriptionRepository } from '../../ports/SubscriptionRepository'

export type SubscriberStatusFilter = 'all' | 'active' | 'delinquent' | 'cancelled' | 'trial'

export type CanalSubscriberView = {
  id: string
  name: string
  telegram: string
  telegramId: string
  email: string
  plan: string
  planId: string
  status: 'active' | 'delinquent' | 'cancelled' | 'trial'
  nextBilling: string
  joinedAt: string
  totalPaid: number
  paymentMethod: 'pix' | 'credit_card'
}

/**
 * Para o MVP, a busca e o filtro continuam sendo aplicados na lista completa do canal
 * após a consulta do banco. Isso preserva o comportamento atual da tela e evita um
 * mecanismo mais complexo de consulta com paginação e filtro dinâmico no Prisma.
 */
export class ListarAssinantesDoCanalUseCase {
  constructor(
    private readonly subscriberRepository: SubscriberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(input: { channelId: string; page?: number; pageSize?: number; search?: string; statusFilter?: SubscriberStatusFilter }) {
    const page = Math.max(1, input.page ?? 1)
    const pageSize = Math.max(1, input.pageSize ?? 50)
    const search = input.search?.trim().toLowerCase() ?? ''
    const statusFilter = input.statusFilter ?? 'all'

    const [subscribers, subscriptions, plans] = await Promise.all([
      this.subscriberRepository.listarPorCanal(input.channelId),
      this.subscriptionRepository.listarPorCanal(input.channelId),
      this.planRepository.listarPorChannelId(input.channelId),
    ])

    const plansById = new Map(plans.map(plan => [plan.id, plan]))
    const subscriptionsBySubscriberId = new Map<string, Array<{ planId: string; status: string; dueDate: Date }>>()

    for (const subscription of subscriptions) {
      const current = subscriptionsBySubscriberId.get(subscription.subscriberId) ?? []
      current.push({ planId: subscription.planId, status: subscription.status, dueDate: subscription.dueDate })
      subscriptionsBySubscriberId.set(subscription.subscriberId, current)
    }

    const mapped: CanalSubscriberView[] = subscribers.map(subscriber => {
      const currentSubscriptions = subscriptionsBySubscriberId.get(subscriber.id) ?? []
      const currentSubscription = currentSubscriptions.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0]
      const plan = currentSubscription ? plansById.get(currentSubscription.planId) : undefined
      const status = this.toUiStatus(currentSubscription?.status ?? 'PENDING')
      return {
        id: subscriber.id,
        name: subscriber.name,
        telegram: subscriber.telegram ?? '@sem-telegram',
        telegramId: subscriber.telegramId ?? '',
        email: subscriber.email,
        plan: plan?.name ?? 'Plano',
        planId: currentSubscription?.planId ?? '',
        status,
        nextBilling: currentSubscription ? this.formatDate(currentSubscription.dueDate) : '—',
        joinedAt: this.formatDate(new Date()),
        totalPaid: 0,
        paymentMethod: 'pix',
      }
    })

    const filtered = mapped.filter(subscriber => {
      const matchSearch = !search || [subscriber.name, subscriber.telegram, subscriber.email].some(value => value.toLowerCase().includes(search))
      const matchStatus = statusFilter === 'all' || subscriber.status === statusFilter
      return matchSearch && matchStatus
    })

    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      subscribers: items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    }
  }

  private toUiStatus(status: string): 'active' | 'delinquent' | 'cancelled' | 'trial' {
    if (status === 'ACTIVE') return 'active'
    if (status === 'CANCELLED') return 'cancelled'
    if (status === 'PAST_DUE' || status === 'FAILED') return 'delinquent'
    return 'trial'
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  }
}
