export type MrrHistoryItem = {
  month: string
  mrr: number
}

export type MrrPaymentLike = {
  status?: string
  amount?: number
  createdAt?: Date | string | null
}

export type MrrSubscriptionLike = {
  status?: string
  dueDate?: Date | string | null
  payments?: MrrPaymentLike[]
}

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function calcularMrrPorMes(subscriptions: MrrSubscriptionLike[]): MrrHistoryItem[] {
  const months = new Set<string>()
  const dates: Date[] = []

  for (const subscription of subscriptions) {
    if (subscription.dueDate) {
      const dueDate = new Date(subscription.dueDate)
      if (!Number.isNaN(dueDate.getTime())) {
        dates.push(dueDate)
        months.add(formatMonthKey(dueDate))
      }
    }

    for (const payment of subscription.payments ?? []) {
      const createdAt = payment.createdAt ? new Date(payment.createdAt) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue
      dates.push(createdAt)
      months.add(formatMonthKey(createdAt))
    }
  }

  if (dates.length === 0) return []

  const start = startOfMonth(new Date(Math.min(...dates.map(date => date.getTime()))))
  const end = startOfMonth(new Date(Math.max(...dates.map(date => date.getTime()))))
  const monthKeys: string[] = []
  let cursor = new Date(start)

  while (cursor <= end) {
    monthKeys.push(formatMonthKey(cursor))
    cursor = addMonths(cursor, 1)
  }

  const totals = new Map<string, number>()
  for (const monthKey of monthKeys) {
    totals.set(monthKey, 0)
  }

  for (const subscription of subscriptions) {
    for (const payment of subscription.payments ?? []) {
      if (payment.status !== 'PAID') continue
      const createdAt = payment.createdAt ? new Date(payment.createdAt) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue
      const monthKey = formatMonthKey(createdAt)
      if (!totals.has(monthKey)) totals.set(monthKey, 0)
      totals.set(monthKey, (totals.get(monthKey) ?? 0) + Number(payment.amount ?? 0))
    }
  }

  return monthKeys.map(monthKey => ({ month: monthKey, mrr: Number((totals.get(monthKey) ?? 0).toFixed(2)) }))
}

function formatMonthKey(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]}/${date.getFullYear()}`
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0)
}
