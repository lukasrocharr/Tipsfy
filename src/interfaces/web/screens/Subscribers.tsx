'use client'

import { useState } from 'react'
import { subscribers as allSubs, type Subscriber, type SubscriberStatus } from '../data'
import { Badge, Avatar, Card, Btn, Input, EmptyState, SectionHeader } from '../components/ui'

const STATUSES: { value: SubscriberStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'trial', label: 'Trial' },
  { value: 'delinquent', label: 'Inadimplentes' },
  { value: 'cancelled', label: 'Cancelados' },
]

function DetailDrawer({ sub, onClose }: { sub: Subscriber; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-[#0e0e11] border-l border-[#1e1e24] h-full overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e1e24]">
          <p className="font-semibold text-zinc-100">Detalhes do Assinante</p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                Bloquear acesso ao canal
              </button>
            )}
            {(sub.status === 'cancelled' || sub.status === 'delinquent') && (
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-950/30 hover:bg-emerald-950/50 rounded-lg transition-colors text-sm text-emerald-400">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Reativar acesso
              </button>
            )}
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-sm text-zinc-400 hover:text-zinc-200">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              Reenviar link de acesso
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-lg transition-colors text-sm text-zinc-400 hover:text-zinc-200">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
              Editar plano
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-950/20 hover:bg-red-950/40 rounded-lg transition-colors text-sm text-red-500">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
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
  const [subs] = useState<Subscriber[]>(allSubs)

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
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
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
            icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
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
                        <button className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
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

      {selected && <DetailDrawer sub={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
