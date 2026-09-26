'use client'

import { useEffect, useState } from 'react'
import type { Transaction } from '../data'

export type TransactionFilter = 'all' | 'paid' | 'failed' | 'pending' | 'refunded'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh(status: TransactionFilter = 'all') {
    try {
      setLoading(true)
      setError('')
      const url = status === 'all' ? '/api/tipster/transactions' : `/api/tipster/transactions?status=${status}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Não foi possível carregar as transações.')
      const body = await response.json() as { transactions: Transaction[] }
      setTransactions(body.transactions)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as transações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { transactions, loading, error, refresh }
}
