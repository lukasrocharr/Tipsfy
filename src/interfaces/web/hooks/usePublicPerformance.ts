'use client'

import { useEffect, useState } from 'react'

export type PublicPerformance = {
  channelName: string
  stats: {
    total: number
    wins: number
    losses: number
    pending: number
    winRate: number
    roi: number
    profit: number
    settled: number
  }
  recentTips: Array<{
    id: string
    sport: string
    event: string
    market: string
    odds: number
    units: number
    result: 'green' | 'red' | 'void' | 'pending'
    date: string
    bookmaker: string | null
  }>
}

export function usePublicPerformance(slug?: string | null) {
  const [data, setData] = useState<PublicPerformance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setData(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/public/${encodeURIComponent(slug)}/performance`, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Página pública indisponível no momento.')
        }

        const body = await response.json() as PublicPerformance
        if (active) setData(body)
      } catch (loadError) {
        if (active) {
          setData(null)
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a página pública.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
      controller.abort()
    }
  }, [slug])

  return { data, loading, error }
}
