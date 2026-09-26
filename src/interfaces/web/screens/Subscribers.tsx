'use client'

import { useState } from 'react'
import { Badge, Avatar, Card, Btn, EmptyState, SectionHeader } from '../components/ui'
import { useSubscribers } from '../hooks/useSubscribers'
import { Ban, CircleCheck, Pencil, Plus, Search, Send, Trash2, Users, X } from 'lucide-react'

export type SubscriberStatus = 'active' | 'delinquent' | 'cancelled' | 'trial'

type Subscriber = {
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

const STATUSES: { value: SubscriberStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'trial', label: 'Trial' },
  { value: 'delinquent', label: 'Inadimplentes' },
  { value: 'cancelled', label: 'Cancelados' },
]

function DetailDrawer({ sub, onClose, onCancel }: { sub: Subscriber; onClose: () => void; onCancel: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-[#0e0e11] border-l border-[#1e1e24] h-full overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e1e24]">
          <p className="font-semibold text-zinc-100">Detalhes do Assinante</p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={18} className="text-current" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar name={sub.name} size="lg" />
            <div>
              <p className="font-semibold text-zinc-100">{sub.name}</p>
              <p className="text-sm font-mono text-zinc-500">{sub.telegram}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{sub.email}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between bg-zinc-900/40 rounded-xl px-4 py-3">
            <span className="text-sm text-zinc-400">Status</span>
            <Badge status={sub.status} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Plano', value: sub.plan },
              { label: 'Pagamento', value: sub.paymentMethod === 'pix' ? 'Pix ⚡' : 'Cartão 💳' },
              { label: 'Assinante desde', value: sub.joinedAt },
              { label: 'Próxima cobrança', value: sub.nextBilling },
              { label: 'Total pago', value: `R$ ${sub.totalPaid.toFixed(2).replace('.', ',')}` },
              { label: 'ID Telegram', value: sub.telegramId },
            ].map(d => (
              <div key={d.label} className="bg-zinc-900/30 rounded-lg px-3.5 py-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{d.label}</p>
                <p className="text-sm font-medium text-zinc-200 font-mono">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Ações</p>
            {sub.status === 'active' && (
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-sm text-zinc-400 hover:text-zinc-200">
                <Ban size={16} className="text-current" />
                Bloquear acesso ao canal
              </button>
            )}
            {(sub.status === 'cancelled' || sub.status === 'delinquent') && (
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-950/30 hover:bg-emerald-950/50 rounded-lg transition-colors text-sm text-emerald-400">
                <CircleCheck size={16} className="text-current" />
                Reativar acesso
              </button>
            )}
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-sm text-zinc-400 hover:text-zinc-200">
              <Send size={16} className="text-current" />
              Reenviar link de acesso
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-sm text-zinc-400 hover:text-zinc-200">
              <Pencil size={16} className="text-current" />
              Editar plano
            </button>
            <button onClick={() => onCancel(sub.id)} className="w-full flex items-center gap-3 px-4 py-3 bg-red-950/20 hover:bg-red-950/40 rounded-lg transition-colors text-sm text-red-500">
              <Trash2 size={16} className="text-current" />
              Remover assinante
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Subscribers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | 'all'>('all')
  const [selected, setSelected] = useState<Subscriber | null>(null)
  const { subscribers: subs, cancelarAssinatura } = useSubscribers()

  const filtered = subs.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = s.name.toLowerCase().includes(q) || s.telegram.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: subs.length,
    active: subs.filter(s => s.status === 'active').length,
    trial: subs.filter(s => s.status === 'trial').length,
    delinquent: subs.filter(s => s.status === 'delinquent').length,
    cancelled: subs.filter(s => s.status === 'cancelled').length,
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-6">
      <SectionHeader
        title="Assinantes"
        sub="Gerencie todos os membros do seu canal."
        action={
          <Btn size="sm">
            <Plus size={16} className="text-current" />
            Adicionar manual
          </Btn>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.all, color: 'text-zinc-100' },
          { label: 'Ativos', value: counts.active, color: 'text-emerald-400' },
          { label: 'Inadimplentes', value: counts.delinquent, color: 'text-red-400' },
          { label: 'Cancelados', value: counts.cancelled, color: 'text-zinc-500' },
        ].map(s => (
          <Card key={s.label} className="px-4 py-3 flex items-center gap-3">
            <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
            <span className="text-xs text-zinc-600">{s.label}</span>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-[#1e1e24]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, Telegram ou e-mail..." className="w-full bg-[#18181c] border border-[#1e1e24] rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s.value ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-800/50' : 'bg-[#18181c] text-zinc-500 border border-[#1e1e24] hover:text-zinc-300'}`}>
                {s.label}
                <span className={`ml-1.5 text-[10px] ${statusFilter === s.value ? 'text-emerald-600' : 'text-zinc-700'}`}>
                  {counts[s.value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={24} className="text-current" />}
            title="Nenhum assinante encontrado"
            sub="Tente ajustar os filtros ou crie um link de checkout para atrair seus primeiros assinantes."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e24]">
                  {['Assinante', 'Plano', 'Pagamento', 'Status', 'Próxima Cobrança', 'Total Pago', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <tr key={sub.id} onClick={() => setSelected(sub)} className={`border-b border-[#1e1e24]/40 hover:bg-[#18181c]/40 transition-colors cursor-pointer ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={sub.name} />
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{sub.name}</p>
                          <p className="text-xs text-zinc-600 font-mono">{sub.telegram}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-400 whitespace-nowrap">{sub.plan}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">{sub.paymentMethod === 'pix' ? '⚡ Pix' : '💳 Cartão'}</td>
                    <td className="px-4 py-3.5"><Badge status={sub.status} /></td>
                    <td className="px-4 py-3.5 text-xs font-mono text-zinc-500">{sub.nextBilling}</td>
                    <td className="px-4 py-3.5 text-sm font-mono text-zinc-300">R$ {sub.totalPaid.toFixed(2).replace('.', ',')}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(sub)} className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors">
                          Detalhes
                        </button>
                        <button onClick={() => {
                          if (sub.status === 'active') {
                            void cancelarAssinatura(sub.id)
                          }
                        }} className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                          sub.status === 'active'
                            ? 'bg-red-950/40 hover:bg-red-950/60 text-red-500'
                            : 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-400'
                        }`}>
                          {sub.status === 'active' ? 'Bloquear' : 'Reativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && <DetailDrawer sub={selected} onClose={() => setSelected(null)} onCancel={async (id) => { await cancelarAssinatura(id); setSelected(null) }} />}
    </div>
  )
}
