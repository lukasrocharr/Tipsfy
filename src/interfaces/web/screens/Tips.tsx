'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { tips as defaultTips, type Tip, type TipResult, calcROI } from '../data'
import { ResultBadge, Card, Btn, EmptyState, SectionHeader } from '../components/ui'

const SPORTS = ['Futebol', 'Tênis', 'Basquete', 'Vôlei', 'MMA', 'Outros']
const BOOKMAKERS = ['Bet365', 'Betano', 'Sportingbet', 'Pixbet', 'KTO', 'Outra']

function TipModal({ tip, onClose, onSave }: {
  tip?: Partial<Tip>
  onClose: () => void
  onSave: (t: Tip) => void
}) {
  const [form, setForm] = useState<Partial<Tip>>(tip ?? { sport: 'Futebol', result: 'pending', bookmaker: 'Bet365' })

  const f = (k: keyof Tip) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  function save() {
    if (!form.event || !form.odds || !form.units) return
    onSave({
      id: tip?.id ?? Date.now().toString(),
      sport: form.sport ?? 'Futebol',
      event: form.event,
      market: form.market ?? 'Resultado',
      odds: parseFloat(form.odds as any),
      units: parseFloat(form.units as any),
      result: form.result ?? 'pending',
      date: form.date ?? new Date().toISOString().split('T')[0],
      bookmaker: form.bookmaker,
      notes: form.notes,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-7 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-zinc-100">{tip?.id ? 'Editar Tip' : 'Registrar Nova Tip'}</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Esporte</label>
              <select value={form.sport ?? 'Futebol'} onChange={f('sport')} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all appearance-none">
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Casa de apostas</label>
              <select value={form.bookmaker ?? 'Bet365'} onChange={f('bookmaker')} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all appearance-none">
                {BOOKMAKERS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Evento</label>
            <input value={form.event ?? ''} onChange={f('event')} placeholder="Ex: Flamengo x Palmeiras – Brasileirão" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Mercado</label>
            <input value={form.market ?? ''} onChange={f('market')} placeholder="Ex: Ambas Marcam – Sim, Over 2.5 Gols" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Odd</label>
              <input value={form.odds ?? ''} onChange={f('odds')} type="number" step="0.01" placeholder="2.10" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Unidades</label>
              <input value={form.units ?? ''} onChange={f('units')} type="number" step="0.5" placeholder="1" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Data</label>
              <input value={form.date ?? new Date().toISOString().split('T')[0]} onChange={f('date')} type="date" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 outline-none focus:border-emerald-500/50 transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Resultado</label>
            <div className="grid grid-cols-4 gap-2">
              {(['pending', 'green', 'red', 'void'] as TipResult[]).map(r => {
                const cfg = {
                  pending: { label: 'Aguardando', cls: 'border-amber-800/50 bg-amber-950/30 text-amber-400', active: 'border-amber-500 bg-amber-950/50' },
                  green: { label: '✓ Green', cls: 'border-emerald-800/50 bg-emerald-950/30 text-emerald-400', active: 'border-emerald-500 bg-emerald-950/60' },
                  red: { label: '✗ Red', cls: 'border-red-900/50 bg-red-950/30 text-red-400', active: 'border-red-500 bg-red-950/60' },
                  void: { label: '— Void', cls: 'border-zinc-700/50 bg-zinc-800/30 text-zinc-500', active: 'border-zinc-500 bg-zinc-800/60' },
                }
                const c = cfg[r]
                return (
                  <button key={r} onClick={() => setForm(p => ({ ...p, result: r }))} className={`text-xs font-medium border rounded-lg py-2 transition-all ${form.result === r ? c.active : c.cls}`}>
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Notas (opcional)</label>
            <textarea value={form.notes ?? ''} onChange={f('notes')} placeholder="Análise ou contexto da tip..." rows={2} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Btn>
            <Btn className="flex-1" onClick={save} disabled={!form.event || !form.odds || !form.units}>
              {tip?.id ? 'Salvar' : 'Registrar Tip'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Tips() {
  const [tips, setTips] = useState<Tip[]>(defaultTips)
  const [modal, setModal] = useState<{ open: boolean; tip?: Partial<Tip> }>({ open: false })
  const [sportFilter, setSportFilter] = useState('Todos')
  const [resultFilter, setResultFilter] = useState<TipResult | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { roi, winRate, profit, wins, losses, settled } = calcROI(tips)

  const sports = ['Todos', ...Array.from(new Set(tips.map(t => t.sport)))]

  const filtered = tips.filter(t => {
    const matchSport = sportFilter === 'Todos' || t.sport === sportFilter
    const matchResult = resultFilter === 'all' || t.result === resultFilter
    return matchSport && matchResult
  })

  function handleSave(t: Tip) {
    setTips(prev => {
      const exists = prev.find(x => x.id === t.id)
      return exists ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev]
    })
    setModal({ open: false })
  }

  function updateResult(id: string, result: TipResult) {
    setTips(prev => prev.map(t => t.id === id ? { ...t, result } : t))
  }

  // Monthly chart data
  const monthlyData = [
    { month: 'Jul', profit: 2.1 },
    { month: 'Ago', profit: 3.8 },
    { month: 'Set', profit: profit },
  ]

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-6">
      <SectionHeader
        title="Tips & Performance"
        sub="Registre suas análises e construa prova social verificada."
        action={
          <Btn onClick={() => setModal({ open: true })}>
            <span className="text-lg leading-none">+</span> Nova Tip
          </Btn>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">ROI Acumulado</p>
          <p className={`text-3xl font-bold font-mono ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
          <p className={`text-xs mt-2 font-mono ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}{profit.toFixed(2)}u lucro
          </p>
        </div>
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Taxa de Acerto</p>
          <p className="text-3xl font-bold font-mono text-zinc-100">{winRate.toFixed(0)}%</p>
          <p className="text-xs text-zinc-600 mt-2">{wins}W / {losses}L em {settled}</p>
        </div>
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Tips Totais</p>
          <p className="text-3xl font-bold font-mono text-zinc-100">{tips.length}</p>
          <p className="text-xs text-zinc-600 mt-2">{tips.filter(t => t.result === 'pending').length} aguardando resultado</p>
        </div>
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Odd Média</p>
          <p className="text-3xl font-bold font-mono text-zinc-100">
            {(tips.reduce((s, t) => s + t.odds, 0) / tips.length).toFixed(2)}
          </p>
          <p className="text-xs text-zinc-600 mt-2">nas {tips.length} entradas</p>
        </div>
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 col-span-2">
          <p className="text-sm font-semibold text-zinc-100 mb-1">Lucro Mensal (unidades)</p>
          <p className="text-xs text-zinc-600 mb-5">Últimos 3 meses</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyData} barSize={32}>
              <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v}u`} />
              <Tooltip formatter={(v) => [`${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(2)}u`, 'Lucro']} contentStyle={{ background: '#18181c', border: '1px solid #1e1e24', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#71717a' }} itemStyle={{ color: '#10b981' }} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-zinc-100 mb-4">Por Esporte</p>
          <div className="space-y-3">
            {Array.from(new Set(tips.map(t => t.sport))).map(sport => {
              const sportTips = tips.filter(t => t.sport === sport)
              const { winRate: wr } = calcROI(sportTips)
              return (
                <div key={sport}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-400">{sport}</span>
                    <span className="text-xs font-mono text-zinc-300">{wr.toFixed(0)}% • {sportTips.length} tips</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/70 rounded-full transition-all" style={{ width: `${wr}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-[#1e1e24]">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-600 self-center mr-1">Esporte:</span>
            {sports.map(s => (
              <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-800/50' : 'bg-[#18181c] text-zinc-500 border border-[#1e1e24] hover:text-zinc-300'}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap ml-auto">
            <span className="text-xs text-zinc-600 self-center mr-1">Resultado:</span>
            {([['all', 'Todos'], ['pending', '⧗'], ['green', '✓ Green'], ['red', '✗ Red'], ['void', '— Void']] as [TipResult | 'all', string][]).map(([v, l]) => (
              <button key={v} onClick={() => setResultFilter(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${resultFilter === v ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-800/50' : 'bg-[#18181c] text-zinc-500 border border-[#1e1e24] hover:text-zinc-300'}`}>{l}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            title="Nenhuma tip encontrada"
            sub="Registre sua primeira tip para começar a construir seu histórico de performance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e24]">
                  {['Data', 'Esporte', 'Evento / Mercado', 'Odd', 'Unidades', 'Bookmaker', 'Resultado', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tip, i) => (
                  <>
                    <tr key={tip.id} className={`border-b border-[#1e1e24]/40 hover:bg-[#18181c]/30 transition-colors cursor-pointer ${i === filtered.length - 1 && expandedId !== tip.id ? 'border-b-0' : ''}`} onClick={() => setExpandedId(expandedId === tip.id ? null : tip.id)}>
                      <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{tip.date}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 px-2 py-1 rounded-md whitespace-nowrap">{tip.sport}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-zinc-200 max-w-xs truncate">{tip.event}</p>
                        {tip.market && <p className="text-xs text-zinc-600 mt-0.5 truncate max-w-xs">{tip.market}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono font-semibold text-zinc-200">{tip.odds.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-zinc-400">{tip.units}u</td>
                      <td className="px-4 py-3.5 text-xs text-zinc-600">{tip.bookmaker ?? '—'}</td>
                      <td className="px-4 py-3.5"><ResultBadge result={tip.result} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setModal({ open: true, tip })} className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-2.5 py-1.5 rounded-lg transition-colors">Editar</button>
                          {tip.result === 'pending' && (
                            <div className="flex gap-1">
                              <button onClick={() => updateResult(tip.id, 'green')} className="text-xs bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-400 px-2.5 py-1.5 rounded-lg transition-colors">Green</button>
                              <button onClick={() => updateResult(tip.id, 'red')} className="text-xs bg-red-950/40 hover:bg-red-950/70 text-red-400 px-2.5 py-1.5 rounded-lg transition-colors">Red</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === tip.id && tip.notes && (
                      <tr key={`${tip.id}-notes`} className="border-b border-[#1e1e24]/40 bg-zinc-900/20">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <svg className="text-zinc-600 flex-shrink-0 mt-0.5" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
                            <p className="text-xs text-zinc-500 italic">{tip.notes}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal.open && <TipModal tip={modal.tip} onClose={() => setModal({ open: false })} onSave={handleSave} />}
    </div>
  )
}
