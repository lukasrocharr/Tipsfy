'use client'

import { useState } from 'react'
import type { Plan, PlanPeriod } from '../data'
import { Card, Btn, Input, SectionHeader } from '../components/ui'
import { usePlans } from '../hooks/usePlans'
import { Check, CircleCheck, Copy, Pencil, Trash2 } from 'lucide-react'

const PERIOD_LABEL: Record<PlanPeriod, string> = { monthly: 'Mensal', quarterly: 'Trimestral', annual: 'Anual' }
const PERIOD_BADGE: Record<PlanPeriod, string> = { monthly: '', quarterly: '16% off', annual: '33% off' }
const PERIOD_SUB: Record<PlanPeriod, string> = { monthly: '/mês', quarterly: '/trimestre', annual: '/ano' }

function CheckoutPreview({ plan }: { plan: Partial<Plan> }) {
  const price = plan.price ?? 0
  const period = plan.period ?? 'monthly'
  return (
    <div className="bg-[#08080a] border border-[#1e1e24] rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">R</div>
        <div>
          <p className="font-semibold text-zinc-100">Rafael Tipster</p>
          <p className="text-xs text-zinc-500 font-mono">@SinaisFutebolVIP</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
      </div>

      {/* Plan card */}
      <div className="bg-[#111114] border border-emerald-500/20 rounded-xl p-4 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-zinc-100">{plan.name || 'Nome do Plano'}</p>
              {plan.description && <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>}
            </div>
            {PERIOD_BADGE[period] && (
              <span className="text-xs bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 rounded-full px-2 py-0.5 font-medium whitespace-nowrap ml-2">{PERIOD_BADGE[period]}</span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              R$ {price ? price.toFixed(2).replace('.', ',') : '—'}
            </span>
            <span className="text-xs text-zinc-500">{PERIOD_SUB[period]}</span>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="space-y-2 mb-5">
        {['Acesso imediato ao grupo VIP', 'Sinais em tempo real via Telegram', 'Histórico de performance verificado', 'Suporte direto com o tipster'].map(f => (
          <div key={f} className="flex items-center gap-2.5 text-xs text-zinc-400">
            <CircleCheck size={14} className="text-emerald-400" />
            {f}
          </div>
        ))}
      </div>

      {/* Payment method tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[{ id: 'pix', label: 'Pix', icon: '⚡', sub: 'Instantâneo' }, { id: 'card', label: 'Cartão', icon: '💳', sub: 'Crédito/Débito' }].map((m, i) => (
          <div key={m.id} className={`rounded-lg p-2.5 border cursor-pointer transition-all ${i === 0 ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-[#1e1e24] bg-[#18181c]'}`}>
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{m.icon}</span>
              <div>
                <p className="text-xs font-semibold text-zinc-200">{m.label}</p>
                <p className="text-[10px] text-zinc-600">{m.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20">
        Assinar agora →
      </button>
      <p className="text-[10px] text-zinc-700 text-center mt-3">Pagamento seguro • Cancele quando quiser</p>
    </div>
  )
}

export default function Plans() {
  // Antes: useState inicializado com plans de data.ts. Agora: usePlans busca e persiste pela API,
  // mantendo o mesmo formato Plan para preservar o JSX aprovado da tela.
  const { plans, criarPlano, editarPlano, removerPlano, error } = usePlans()
  const [form, setForm] = useState<Partial<Plan>>({ period: 'monthly', active: true })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function save() {
    if (!form.name || !form.price) return
    const planInput = { name: form.name, price: form.price, period: form.period ?? 'monthly', active: form.active ?? true, description: form.description }
    if (editingId) {
      await editarPlano(editingId, planInput)
      setEditingId(null)
    } else {
      await criarPlano(planInput)
    }
    setForm({ period: 'monthly', active: true })
  }

  function startEdit(plan: Plan) {
    setEditingId(plan.id)
    setForm(plan)
  }

  function removePlan(id: string) {
    void removerPlano(id)
  }

  function copyLink(plan: Plan) {
    navigator.clipboard.writeText(`${window.location.origin}/checkout/${plan.checkoutSlug}`).catch(() => {})
    setCopiedId(plan.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const f = (k: keyof Plan) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: k === 'price' ? parseFloat(e.target.value) || 0 : e.target.value }))

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-6">
      <SectionHeader title="Planos de Assinatura" sub="Configure os planos que seus assinantes poderão contratar." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: form + list */}
        <div className="space-y-6">
          {/* Form */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-100 mb-5">{editingId ? 'Editar Plano' : 'Novo Plano'}</h2>
            <div className="space-y-4">
              <Input label="Nome do plano" value={form.name ?? ''} onChange={f('name')} placeholder="Ex: VIP Mensal" />
              <Input label="Descrição curta (opcional)" value={form.description ?? ''} onChange={f('description')} placeholder="Ex: Acesso ao grupo VIP com sinais diários." />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">R$</span>
                    <input value={form.price ?? ''} onChange={f('price')} type="number" step="0.01" placeholder="39,90" className="bg-[#18181c] border border-[#1e1e24] rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Periodicidade</label>
                  <select value={form.period ?? 'monthly'} onChange={f('period')} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all appearance-none">
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="annual">Anual</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                {editingId && (
                  <Btn variant="secondary" className="flex-1" onClick={() => { setEditingId(null); setForm({ period: 'monthly', active: true }) }}>
                    Cancelar
                  </Btn>
                )}
                <Btn className="flex-1" onClick={save} disabled={!form.name || !form.price}>
                  {editingId ? 'Salvar Alterações' : '+ Criar Plano'}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Existing plans list */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Planos Cadastrados</p>
            <div className="space-y-3">
              {plans.length === 0 ? (
                <Card className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-600">Nenhum plano cadastrado ainda.</p>
                </Card>
              ) : (
                plans.map(plan => (
                  <Card key={plan.id} className="px-5 py-4 hover:border-zinc-700/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 text-sm font-bold font-mono">₿</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-100 truncate">{plan.name}</p>
                            <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded whitespace-nowrap">{PERIOD_LABEL[plan.period]}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-lg font-bold font-mono text-emerald-400">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                            <span className="text-xs text-zinc-600">• {plan.subscribers} assinantes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => copyLink(plan)} className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copiedId === plan.id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-800/40' : 'bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400'}`}>
                          {copiedId === plan.id ? <><Check size={14} className="text-current" />Copiado</> : <>
                            <Copy size={14} className="text-current" />
                            Link
                          </>}
                        </button>
                        <button onClick={() => startEdit(plan)} className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"><Pencil size={14} className="text-current" />Editar</button>
                        <button onClick={() => removePlan(plan.id)} aria-label="Excluir plano" className="text-xs bg-red-950/40 hover:bg-red-950/60 text-red-500 px-2.5 py-1.5 rounded-lg transition-colors"><Trash2 size={14} className="text-current" /></button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: live checkout preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Preview do Checkout</p>
          <CheckoutPreview plan={form} />
          <p className="text-xs text-zinc-700 text-center mt-3">Esta é a página que seus assinantes verão ao clicar no link.</p>
          {error && <p className="text-xs text-red-400 text-center mt-3" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  )
}
