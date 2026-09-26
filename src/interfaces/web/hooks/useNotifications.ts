'use client'

import { useEffect, useState } from 'react'

export type NotificationItem = {
  id: string
  type: 'payment' | 'subscriber' | 'system' | 'alert'
  title: string
  message: string
  read: boolean
  time: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Não foi possível carregar as notificações.')
      const body = await response.json() as { notifications: NotificationItem[] }
      setNotifications(body.notifications)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as notificações.')
    } finally {
      setLoading(false)
    }
  }

  async function marcarComoLida(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Não foi possível atualizar a notificação.')
      setNotifications(current => current.map(notification => notification.id === id ? { ...notification, read: true } : notification))
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Não foi possível atualizar a notificação.')
    }
  }

  return { notifications, loading, error, refresh, marcarComoLida }
}
