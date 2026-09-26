'use client'

import { useEffect, useState } from 'react'
import type { TipResult } from '../data'

export type TipListItem = {
  id: string
  channelId: string
  sport: string
  event: string
  market: string
  odds: number
  units: number
  result: TipResult
  date: string
  potentialReturn: number | null
  bookmaker: string | null
  notes: string | null
}

export function useTips(channelId?: string | null) {
  const [tips, setTips] = useState<TipListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    if (!channelId) {
      setTips([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/channels/${channelId}/tips`)
      if (!response.ok) throw new Error('Não foi possível carregar as tips.')
      const body = await response.json() as { tips: TipListItem[] }
      setTips(body.tips)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as tips.')
    } finally {
      setLoading(false)
    }
  }

  async function createTip(input: Omit<TipListItem, 'id' | 'channelId'> & { id?: string; broadcastToChannelIds?: string[] }) {
    if (!channelId) throw new Error('Canal ainda não disponível.')
    const response = await fetch(`/api/channels/${channelId}/tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, id: input.id, broadcastToChannelIds: input.broadcastToChannelIds ?? [] }),
    })
    if (!response.ok) throw new Error('Não foi possível salvar a tip.')
    const body = await response.json() as { tip: TipListItem & { broadcastResults?: Array<{ channelId: string; channelName?: string; status: 'sent' | 'failed' | 'skipped'; reason?: string }> } }
    setTips(current => {
      const exists = current.some(item => item.id === body.tip.id)
      return exists ? current.map(item => item.id === body.tip.id ? body.tip : item) : [body.tip, ...current]
    })
    return body.tip
  }

  async function updateResult(id: string, result: TipResult) {
    const response = await fetch(`/api/tips/${id}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    })
    if (!response.ok) throw new Error('Não foi possível atualizar o resultado da tip.')
    setTips(current => current.map(item => item.id === id ? { ...item, result } : item))
  }

  useEffect(() => {
    void refresh()
  }, [channelId])

  return { tips, loading, error, refresh, createTip, updateResult }
}
