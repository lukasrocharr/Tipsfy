'use client'

import { useState } from 'react'
import { transactions, mrrHistory, type Transaction } from '../data'
import { TxBadge, Card, SectionHeader } from '../components/ui'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2">
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-mono font-semibold text-emerald-400">R$ {payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function Financials() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'failed' | 'pending' | 'refunded'>('all')

  const filtered = transactions.filter(t => filter === 'all' || t.status === filter)

  const totalPaid = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
  const totalFailed = transactions.filter(t => t.status === 'failed').reduce((s, t) => s + t.amount, 0)
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const currentMRR = mrrHistory[mrrHistory.length - 1].mrr

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-6">
      <SectionHeader
        title="Financeiro"
        sub="Acompanhe receitas, pagamentos e solicitações de saque."
        action={
          <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Solicitar Saque
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">MRR Atual</p>
          <p className="text-2xl font-bold font-mono text-emerald-400">R$ {currentMRR.toFixed(2).replace('.', ',')}</p>
          <p className="text-xs text-zinc-600 mt-2">receita mensal recorrente</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Recebido (mês)</p>
          <p className="text-2xl font-bold font-mono text-zinc-100">R$ {totalPaid.toFixed(2).replace('.', ',')}</p>
          <p className="text-xs text-zinc-600 mt-2">{transactions.filter(t => t.status === 'paid').length} pagamentos</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Inadimplência</p>
          <p className="text-2xl font-bold font-mono text-red-400">R$ {totalFailed.toFixed(2).replace('.', ',')}</p>
          <p className="text-xs text-zinc-600 mt-2">{transactions.filter(t => t.status === 'failed').length} cobranças falhas</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Saldo Disponível</p>
          <p className="text-2xl font-bold font-mono text-zinc-100">R$ {(totalPaid * 0.92).toFixed(2).replace('.', ',')}</p>
          <p className="text-xs text-zinc-600 mt-2">após taxa de 8%</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Evolução do MRR</p>
            <p className="text-xs text-zinc-500 mt-0.5">Últimos 6 meses</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" />
            MRR (R$)
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mrrHistory} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="#1e1e24" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e1e24', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Transactions table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e24] flex-wrap gap-3">
          <p className="text-sm font-semibold text-zinc-100">Histórico de Transações</p>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'paid', 'failed', 'pending', 'refunded'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-800/50' : 'bg-[#18181c] text-zinc-500 border border-[#1e1e24] hover:text-zinc-300'}`}>
                {s === 'all' ? 'Todas' : s === 'paid' ? 'Pagas' : s === 'failed' ? 'Falhas' : s === 'pending' ? 'Pendentes' : 'Reembolsos'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e24]">
                {['Data', 'Assinante', 'Plano', 'Método', 'Valor', 'Status', 'Descrição'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={tx.id} className={`border-b border-[#1e1e24]/40 hover:bg-[#18181c]/30 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{tx.date}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-zinc-200">{tx.subscriberName}</p>
                    <p className="text-xs text-zinc-600 font-mono">{tx.telegram}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500">{tx.plan}</td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500">{tx.method === 'pix' ? '⚡ Pix' : '💳 Cartão'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-mono font-semibold ${tx.status === 'paid' ? 'text-emerald-400' : tx.status === 'failed' ? 'text-red-400' : tx.status === 'refunded' ? 'text-zinc-500 line-through' : 'text-amber-400'}`}>
                      {tx.status === 'failed' ? '-' : tx.status === 'refunded' ? '' : '+'}R$ {tx.amount.toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><TxBadge status={tx.status} /></td>
                  <td className="px-4 py-3.5 text-xs text-zinc-600">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#1e1e24] bg-zinc-900/20">
          <span className="text-xs text-zinc-600">{filtered.length} transações</span>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exportar CSV
          </button>
        </div>
      </Card>
    </div>
  )
}
