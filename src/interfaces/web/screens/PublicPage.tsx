'use client'

import { useParams } from 'next/navigation'
import { usePublicPerformance } from '../hooks/usePublicPerformance'
import { ResultBadge } from '../components/ui'
import Link from 'next/link'
import { Check, TrendingUp } from 'lucide-react'

export default function PublicPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? null
  const { data, loading, error } = usePublicPerformance(slug)

  if (loading) {
    return <div className="min-h-screen bg-[#08080a] text-zinc-400 flex items-center justify-center">Carregando página pública…</div>
  }

  if (error || !data) {
    return <div className="min-h-screen bg-[#08080a] text-zinc-400 flex items-center justify-center">Página pública indisponível no momento.</div>
  }

  const { stats, recentTips } = data
  const roi = stats.roi
  const winRate = stats.winRate
  const profit = stats.profit
  const publicTips = recentTips

  return (
    <div className="min-h-screen bg-[#08080a]">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-[#1e1e24]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-[#08080a] to-[#08080a] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />

        <div className="relative max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-emerald-500/30">
              R
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#08080a] flex items-center justify-center">
              <Check size={12} className="text-current" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-zinc-100 mb-2 tracking-tight">{data.channelName}</h1>
          <p className="text-zinc-500 font-mono text-sm mb-1">@{slug}</p>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mt-4 leading-relaxed">
            Análises profissionais para futebol e tênis. Mais de 3 anos de histórico verificado
            publicamente. Transparência total, sem promessas milagrosas.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            {['⚽ Futebol', '🎾 Tênis', '📊 Verificado'].map(tag => (
              <span key={tag} className="text-xs bg-zinc-900/80 border border-[#1e1e24] text-zinc-400 px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-10 pb-32">

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center hover:border-zinc-700/50 transition-colors">
            <p className={`text-2xl font-black font-mono ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-600 mt-1">ROI 30 dias</p>
          </div>
          <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center hover:border-zinc-700/50 transition-colors">
            <p className="text-2xl font-black font-mono text-zinc-100">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-zinc-600 mt-1">Taxa de acerto</p>
          </div>
          <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center hover:border-zinc-700/50 transition-colors">
            <p className="text-2xl font-black font-mono text-zinc-100">{publicTips.length}</p>
            <p className="text-xs text-zinc-600 mt-1">Tips validadas</p>
          </div>
        </div>

        {/* Profit highlight */}
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-5 mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              {profit >= 0 ? `+${profit.toFixed(2)} unidades` : `${profit.toFixed(2)} unidades`} de lucro no total
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Calculado sobre as {stats.settled} tips validadas.</p>
          </div>
        </div>

        {/* Tips history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Últimas Tips Verificadas</p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Green
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1" /> Red
            </div>
          </div>

          <div className="space-y-2">
            {publicTips.map(tip => (
              <div key={tip.id} className={`rounded-xl px-4 py-3.5 border flex items-center gap-4 transition-all hover:border-zinc-700/50 ${
                tip.result === 'green' ? 'bg-emerald-950/10 border-emerald-900/30' :
                tip.result === 'red' ? 'bg-red-950/10 border-red-900/30' :
                'bg-[#111114] border-[#1e1e24]'
              }`}>
                <div className={`w-1.5 flex-shrink-0 self-stretch rounded-full ${tip.result === 'green' ? 'bg-emerald-500' : tip.result === 'red' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{tip.event}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{tip.market}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-zinc-600">{tip.date}</span>
                    <span className="text-[10px] text-zinc-700">{tip.sport}</span>
                    <span className="text-[10px] font-mono text-zinc-500">Odd: <span className="text-zinc-300">{tip.odds.toFixed(2)}</span></span>
                    <span className="text-[10px] font-mono text-zinc-500">{tip.units}u</span>
                  </div>
                </div>
                <ResultBadge result={tip.result} />
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-10 bg-[#111114] border border-[#1e1e24] rounded-2xl p-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5 text-center">O que assinantes dizem</p>
          <div className="space-y-4">
            {[
              { name: 'Carlos M.', handle: '@carlosm', text: 'Melhor investimento do mês. ROI consistente e comunicação transparente. Recomendo demais!', rating: 5 },
              { name: 'Ana P.', handle: '@anapaula', text: 'Finalmente um tipster honesto. Quando red, ele explica o motivo. Confiança total.', rating: 5 },
              { name: 'Lucas O.', handle: '@lucasoliv', text: 'Já testei vários, esse é diferente. Não promete impossível mas entrega muito.', rating: 5 },
            ].map(r => (
              <div key={r.name} className="bg-zinc-900/40 rounded-xl px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">{r.name[0]}</div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{r.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">{r.handle}</p>
                  </div>
                  <div className="ml-auto flex">{Array.from({ length: r.rating }).map((_, i) => <span key={i} className="text-amber-400 text-xs">★</span>)}</div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed italic">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#08080a]/95 backdrop-blur-md border-t border-[#1e1e24]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-100">Acesso ao canal</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-black font-mono text-emerald-400">VIP</span>
              <span className="text-xs text-zinc-600">• Conteúdo premium</span>
            </div>
          </div>
          <Link href="/" className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black px-5 py-3 rounded-xl transition-all text-sm whitespace-nowrap shadow-xl shadow-emerald-500/25 flex-shrink-0">
            Voltar ao início →
          </Link>
        </div>
      </div>
    </div>
  )
}
