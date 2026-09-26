'use client'

import { useEffect, useState } from 'react'

export type DashboardSummaryEntry = {
  month: string
  mrr: number
}

export type DashboardSummaryData = {
  subscribers: unknown[]
  mrrHistory: DashboardSummaryEntry[]
  notifications: Array<{ id: string; title: string; message: string; read: boolean; type: string; time: string }>
  tips: unknown[]
  active: number
  delinquent: number
  mrr: number
  unread: number
}

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummaryData>({
    subscribers: [],
    mrrHistory: [],
    notifications: [],
    tips: [],
    active: 0,
    delinquent: 0,
    mrr: 0,
    unread: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/dashboard/summary')
      if (!response.ok) throw new Error('Não foi possível carregar o resumo do dashboard.')
      const body = await response.json() as DashboardSummaryData
      setData(body)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o resumo do dashboard.')
    } finally {
      setLoading(false)
    }
  }

  return { ...data, loading, error, refresh }
}
