import { calcularMrrPorMes, type MrrHistoryItem } from '../../../domain/services/CalculoDeMrr'
import type { Notification } from '../../../domain/entities/Notification'

export type DashboardSummaryParams = {
  subscriptions: Array<{
    status?: string
    dueDate?: Date | string | null
    payments?: Array<{ status?: string; amount?: number; createdAt?: Date | string | null }>
  }>
  notifications: Notification[]
  tips?: unknown[]
}

export class ObterResumoDoDashboardUseCase {
  execute(input: DashboardSummaryParams) {
    const mrrHistory: MrrHistoryItem[] = calcularMrrPorMes(input.subscriptions)
    const active = input.subscriptions.filter(sub => sub.status === 'ACTIVE').length
    const delinquent = input.subscriptions.filter(sub => sub.status === 'PAST_DUE' || sub.status === 'FAILED').length
    const mrr = mrrHistory.length > 0 ? mrrHistory[mrrHistory.length - 1].mrr : 0
    const unread = input.notifications.filter(notification => !notification.read).length

    return {
      subscribers: input.subscriptions,
      mrrHistory,
      notifications: input.notifications,
      tips: input.tips ?? [],
      active,
      delinquent,
      mrr,
      unread,
    }
  }
}
