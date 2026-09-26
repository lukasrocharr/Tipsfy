'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { calcROI } from '../data'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useNotifications } from '../hooks/useNotifications'
import { MetricCard, Badge, Avatar, Card } from '../components/ui'
import { Bell, ChevronRight } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-mono font-semibold text-emerald-400">R$ {payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const summary = useDashboardSummary()
  const notificationsHook = useNotifications()

  const subscribers = (summary.subscribers ?? []) as Array<{ id: string; name: string; telegram: string; status: string; plan: string; nextBilling: string }>
  const mrrHistory = summary.mrrHistory
  const notifications = notificationsHook.notifications.length ? notificationsHook.notifications : summary.notifications
  const tips = (summary.tips ?? []) as Array<{ id: string; result: 'green' | 'red' | 'void' | 'pending'; odds: number; units: number; date?: string; sport?: string; event?: string; market?: string }>
  const { roi, winRate } = calcROI(tips as any)

  const active = summary.active
  const delinquent = summary.delinquent
  const mrr = summary.mrr
  const unread = notifications.filter((n: { read: boolean }) => !n.read).length
  const recentSubs = subscribers.slice(0, 5).map(sub => ({
    ...sub,
    status: (sub.status === 'ACTIVE' ? 'active' : sub.status === 'PAST_DUE' || sub.status === 'FAILED' ? 'delinquent' : sub.status === 'CANCELLED' ? 'cancelled' : 'trial') as 'active' | 'delinquent' | 'cancelled' | 'trial',
  }))

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Visão geral do seu negócio • setembro 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 rounded-lg bg-[#18181c] border border-[#1e1e24] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all">
              <Bell size={16} className="text-current" />
              {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[#111114] border border-[#1e1e24] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e1e24] flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100">Notificações</span>
                  <span className="text-xs text-emerald-400 cursor-pointer hover:text-emerald-300">Marcar todas lidas</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n: { id: string; type: string; title: string; message: string; read: boolean; time: string }) => (
                    <div key={n.id} className={`px-4 py-3.5 border-b border-[#1e1e24]/50 hover:bg-[#18181c]/40 transition-colors flex gap-3 ${!n.read ? 'bg-emerald-950/10' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                        n.type === 'payment' ? 'bg-emerald-950/60 text-emerald-400' :
                        n.type === 'alert' ? 'bg-red-950/60 text-red-400' :
                        n.type === 'subscriber' ? 'bg-blue-950/60 text-blue-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {n.type === 'payment' ? '₿' : n.type === 'alert' ? '!' : n.type === 'subscriber' ? '👤' : '⚙'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">{n.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-zinc-700 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Antes: prop navigate() do App.tsx monolítico. Agora: useRouter do Next.js. */}
          <button onClick={() => router.push('/plans')} className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            <span>+</span> Novo Plano
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="MRR Atual" value={`R$ ${mrr.toFixed(2).replace('.', ',')}`} trend="+12%" sub="vs. mês anterior" accent />
        <MetricCard label="Assinantes Ativos" value={`${active}`} trend="+2" sub="este mês" />
        <MetricCard label="Taxa de Churn" value="3,8%" trend="-0,4%" sub="últimos 30 dias" />
        <MetricCard label="Inadimplentes" value={`${delinquent}`} sub="aguardando pagamento" negative={delinquent > 0} />
      </div>

      {/* Chart + Performance side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* MRR Chart */}
        <Card className="p-6 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Receita Mensal Recorrente</p>
              <p className="text-xs text-zinc-500 mt-0.5">Últimos 6 meses</p>
            </div>
            <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full font-medium">+28% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mrrHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e1e24', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Tips performance summary */}
        <Card className="p-6">
          <p className="text-sm font-semibold text-zinc-100 mb-1">Performance de Tips</p>
          <p className="text-xs text-zinc-500 mb-5">Últimos 30 dias</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-500">Taxa de Acerto</span>
                <span className="text-sm font-mono font-semibold text-zinc-100">{winRate.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${winRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-500">ROI Acumulado</span>
                <span className={`text-sm font-mono font-semibold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${Math.min(Math.abs(roi), 100)}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: 'Total', value: tips.length, color: 'text-zinc-300' },
                { label: 'Greens', value: tips.filter(t => t.result === 'green').length, color: 'text-emerald-400' },
                { label: 'Reds', value: tips.filter(t => t.result === 'red').length, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-zinc-900/50 rounded-lg p-2.5 text-center">
                  <p className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/tips')} className="w-full text-xs text-emerald-400 hover:text-emerald-300 transition-colors text-center pt-1">
              Ver histórico completo →
            </button>
          </div>
        </Card>
      </div>

      {/* Recent subscribers + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent subs table */}
        <Card className="col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e24]">
            <p className="text-sm font-semibold text-zinc-100">Assinantes Recentes</p>
            <button onClick={() => router.push('/subscribers')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todos →</button>
          </div>
          <table className="w-full">
            <tbody>
              {recentSubs.map((sub, i) => (
                <tr key={sub.id} className={`border-b border-[#1e1e24]/50 hover:bg-[#18181c]/30 transition-colors ${i === recentSubs.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={sub.name} />
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{sub.name}</p>
                        <p className="text-xs text-zinc-600 font-mono">{sub.telegram}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-zinc-500 hidden sm:table-cell">{sub.plan}</td>
                  <td className="px-4 py-3.5"><Badge status={sub.status} /></td>
                  <td className="px-4 py-3.5 text-xs font-mono text-zinc-500 hidden md:table-cell">{sub.nextBilling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Ações Rápidas</p>
            <div className="space-y-2">
              {[
                { label: 'Criar novo plano', icon: '₿', screen: 'plans', color: 'text-emerald-400 bg-emerald-950/50' },
                { label: 'Registrar nova tip', icon: '◈', screen: 'tips', color: 'text-blue-400 bg-blue-950/50' },
                { label: 'Ver assinantes', icon: '👥', screen: 'subscribers', color: 'text-violet-400 bg-violet-950/50' },
                { label: 'Página pública', icon: '◉', screen: 'public', color: 'text-amber-400 bg-amber-950/50' },
              ].map(a => (
                <button key={a.screen} onClick={() => router.push(`/${a.screen}`)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-[#18181c]/60 transition-colors group text-left">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${a.color}`}>{a.icon}</span>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{a.label}</span>
                  <ChevronRight size={16} className="ml-auto text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </button>
              ))}
            </div>
          </Card>

          {/* Delinquency alert */}
          {delinquent > 0 && (
            <Card className="p-5 border-red-900/40 bg-red-950/10">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-950/60 flex items-center justify-center flex-shrink-0 text-red-400 text-sm">!</div>
                <div>
                  <p className="text-sm font-semibold text-red-400">{delinquent} inadimplentes</p>
                  <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">Acesso bloqueado automaticamente após 3 dias de atraso.</p>
                  <button onClick={() => router.push('/subscribers')} className="text-xs text-red-400 hover:text-red-300 mt-2 transition-colors">Gerenciar →</button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
