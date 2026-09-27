'use client'

import { useEffect, useState } from 'react'
import type { Plan, PlanPeriod } from '../data'

type PlanInput = { name: string; price: number; period: PlanPeriod; active: boolean; description?: string }
export function usePlans(channelId: string | null) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!channelId) {
      setPlans([])
      return () => { active = false }
    }

    setPlans([])
    setError('')
    void (async () => {
      try {
        const response = await fetch(`/api/channels/${encodeURIComponent(channelId)}/plans`)
        if (!response.ok) throw new Error('Não foi possível carregar os planos.')
        const body = await response.json() as { plans: Plan[] }
        if (active) setPlans(body.plans)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os planos.')
        }
      }
    })()

    return () => { active = false }
  }, [channelId])

  async function criarPlano(input: PlanInput) {
    if (!channelId) {
      setError('Selecione um canal antes de criar o plano.')
      return
    }
    try {
      setError('')
      const response = await fetch(`/api/channels/${encodeURIComponent(channelId)}/plans`, {
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

  return { plans, channelId, criarPlano, editarPlano, removerPlano, error }
}