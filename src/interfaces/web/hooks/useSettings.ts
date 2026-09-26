'use client'

import { useCallback, useState } from 'react'

export type SettingsProfilePayload = {
  name?: string
  email?: string
  bio?: string
  website?: string
}

export type NotificationPreferencesPayload = {
  newSubscriber: boolean
  payment: boolean
  delinquent: boolean
  tips: boolean
  weekly: boolean
}

export type BankDetailsPayload = {
  pixType?: string
  pixKey?: string
  bank?: string
  agency?: string
  account?: string
  accountType?: string
  ownerDocument?: string
}

export function useSettings() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProfile = useCallback(async (payload: SettingsProfilePayload) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/tipster/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(body?.message ?? 'Não foi possível salvar o perfil.')
      }
      setSaved(true)
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const saveNotificationPreferences = useCallback(async (payload: NotificationPreferencesPayload) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/tipster/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(body?.message ?? 'Não foi possível salvar as preferências.')
      }
      setSaved(true)
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferências.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const saveBankDetails = useCallback(async (payload: BankDetailsPayload) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/tipster/bank-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(body?.message ?? 'Não foi possível salvar os dados bancários.')
      }
      setSaved(true)
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados bancários.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const deleteAccount = useCallback(async (reason?: string) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/tipster/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(body?.message ?? 'Não foi possível encerrar a conta.')
      }
      setSaved(true)
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar a conta.')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, saved, error, setSaved, saveProfile, saveNotificationPreferences, saveBankDetails, deleteAccount }
}
