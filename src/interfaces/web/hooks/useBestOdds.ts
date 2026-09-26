'use client'

import { useEffect, useState } from 'react'

export type BestOddSuggestion = {
  eventId: string
  sportKey: string
  commenceTime?: string
  homeTeam: string
  awayTeam: string
  selection: string
  price: number
  bookmaker: string
  market: string
}

export function useBestOdds(sportKey?: string | null) {
  const [data, setData] = useState<BestOddSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!sportKey) {
      setData([])
      setLoading(false)
      return
    }

    let active = true
    const controller = new AbortController()

    void (async () => {
      setLoading(true)
      setError(null)

      try {
        const refreshQuery = reloadToken > 0 ? '&refresh=1' : ''
        const response = await fetch(`/api/odds/best?sport=${encodeURIComponent(sportKey)}${refreshQuery}`, { signal: controller.signal })
        const body = await response.json().catch(() => ({})) as { bestOdds?: BestOddSuggestion[]; message?: string }
        if (!response.ok) {
          throw new Error(body.message ?? 'Não foi possível carregar as odds agora.')
        }

        if (active) setData(body.bestOdds ?? [])
      } catch (requestError) {
        if (active && !(requestError instanceof DOMException && requestError.name === 'AbortError')) {
          setData([])
          setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar as odds agora.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
      controller.abort()
    }
  }, [sportKey, reloadToken])

  return { data, loading, error, refresh: () => setReloadToken(token => token + 1) }
}
