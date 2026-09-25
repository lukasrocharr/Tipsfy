'use client'

import { useEffect, useState } from 'react'
import type { Plan, PlanPeriod } from '../data'

type PlanInput = { name: string; price: number; period: PlanPeriod; active: boolean; description?: string }
type Channel = { id: string; tipsterId: string; telegramChatId: string; name: string }

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [channelId, setChannelId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void loadPlans()
  }, [])

  async function loadPlans() {
    try {
      const response = await fetch('/api/channels')
      if (!response.ok) throw new Error('Não foi possível carregar os canais.')
      const body = await response.json() as { channels: Channel[] }
      const channel = body.channels[0]
      if (!channel) return
      setChannelId(channel.id)
      const plansResponse = await fetch(`/api/channels/${channel.id}/plans`)
      if (!plansResponse.ok) throw new Error('Não foi possível carregar os planos.')
      const plansBody = await plansResponse.json() as { plans: Plan[] }
      setPlans(plansBody.plans)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os planos.')
    }
  }

  async function ensureChannel(): Promise<string> {
    if (channelId) return channelId
    const response = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // O vínculo real do Telegram continua mockado até a Etapa 4.
      body: JSON.stringify({ telegramChatId: 'pending', botTokenEnc: 'pending', name: 'Canal principal' }),
    })
    if (!response.ok) throw new Error('Não foi possível preparar o canal.')
    const body = await response.json() as { channel: Channel }
    setChannelId(body.channel.id)
    return body.channel.id
  }

  async function criarPlano(input: PlanInput) {
    try {
      setError('')
      const id = await ensureChannel()
      const response = await fetch(`/api/channels/${id}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) throw new Error('Não foi possível criar o plano.')
      const body = await response.json() as { plan: Plan }
      setPlans(current => [...current, body.plan])
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar o plano.')
    }
  }

  async function editarPlano(id: string, input: PlanInput) {
    if (!channelId) return
    try {
      setError('')
      const response = await fetch(`/api/channels/${channelId}/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) throw new Error('Não foi possível salvar o plano.')
      const body = await response.json() as { plan: Plan }
      setPlans(current => current.map(plan => plan.id === id ? body.plan : plan))
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Não foi possível salvar o plano.')
    }
  }

  async function removerPlano(id: string) {
    if (!channelId) return
    try {
      setError('')
      const response = await fetch(`/api/channels/${channelId}/plans/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Não foi possível remover o plano.')
      setPlans(current => current.filter(plan => plan.id !== id))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Não foi possível remover o plano.')
    }
  }

  return { plans, criarPlano, editarPlano, removerPlano, error }
}