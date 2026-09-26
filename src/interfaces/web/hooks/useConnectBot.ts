'use client'

import { useEffect, useState } from 'react'

type Channel = { id: string; telegramChatId: string; name: string; connected?: boolean }

export function useConnectBot() {
  const [channelId, setChannelId] = useState<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void loadChannel()
  }, [])

  async function loadChannel() {
    const response = await fetch('/api/channels')
    if (!response.ok) return
    const body = await response.json() as { channels: Channel[] }
    const channel = body.channels[0]
    setChannelId(channel?.id ?? null)
    setChatId(channel?.telegramChatId ?? null)
    setConnected(Boolean(channel?.connected))
  }

  async function ensureChannel(chatId: string): Promise<string> {
    if (channelId) return channelId
    const response = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // O token real só é persistido depois da validação do Use Case de conexão.
      body: JSON.stringify({ telegramChatId: chatId, botTokenEnc: null, name: chatId }),
    })
    if (!response.ok) throw new Error('Não foi possível preparar o canal.')
    const body = await response.json() as { channel: Channel }
    setChannelId(body.channel.id)
    setChatId(body.channel.telegramChatId)
    return body.channel.id
  }

  async function connectBot(token: string, chatId: string): Promise<void> {
    setError('')
    const id = await ensureChannel(chatId)
    const response = await fetch(`/api/channels/${id}/connect-bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId }),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null
      const message = body?.message ?? 'Não foi possível conectar o bot.'
      setError(message)
      throw new Error(message)
    }
    setConnected(true)
  }

  async function disconnectBot(): Promise<void> {
    if (!channelId) return
    setError('')
    const response = await fetch(`/api/channels/${channelId}/bot-token`, { method: 'DELETE' })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null
      const message = body?.message ?? 'Não foi possível desconectar o bot.'
      setError(message)
      throw new Error(message)
    }
    setConnected(false)
  }

  return { channelId, chatId, connected, connectBot, disconnectBot, error }
}
