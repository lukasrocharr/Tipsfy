'use client'

import { useEffect, useState } from 'react'

export type SubscriberStatus = 'active' | 'delinquent' | 'cancelled' | 'trial'

export type Subscriber = {
  id: string
  name: string
  telegram: string
  telegramId: string
  email: string
  plan: string
  planId: string
  status: SubscriberStatus
  nextBilling: string
  joinedAt: string
  totalPaid: number
  paymentMethod: 'pix' | 'credit_card'
}

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh(): Promise<void> {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/channels')
      if (!response.ok) throw new Error('Não foi possível carregar os canais.')
      const channelsBody = await response.json() as { channels: Array<{ id: string }> }
      const channel = channelsBody.channels[0]
      if (!channel) {
        setSubscribers([])
        return
      }

      const subscribersResponse = await fetch(`/api/channels/${channel.id}/subscribers`)
      if (!subscribersResponse.ok) throw new Error('Não foi possível carregar os assinantes.')
      const body = await subscribersResponse.json() as { subscribers: Subscriber[] }
      setSubscribers(body.subscribers)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os assinantes.')
    } finally {
      setLoading(false)
    }
  }

  async function cancelarAssinatura(subscriptionId: string): Promise<void> {
    try {
      setError('')
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'PATCH' })
      if (!response.ok) throw new Error('Não foi possível cancelar a assinatura.')
      setSubscribers(current => current.map(subscriber => subscriber.id === subscriptionId ? { ...subscriber, status: 'cancelled' } : subscriber))
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Não foi possível cancelar a assinatura.')
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { subscribers, loading, error, refresh, cancelarAssinatura }
}
