import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

type Screen = 'onboarding' | 'dashboard' | 'subscribers' | 'plans' | 'tips' | 'financials' | 'public' | 'settings'

type Screen = 'onboarding' | 'plans' | 'dashboard' | 'tips' | 'public'
type SubscriberStatus = 'active' | 'delinquent' | 'cancelled'
type TipResult = 'green' | 'red' | 'void' | 'pending'

interface Subscriber {
  id: string; name: string; telegram: string; plan: string
  status: SubscriberStatus; nextBilling: string; joinedAt: string; amount: number
}
interface Plan {
  id: string; name: string; price: number; period: 'monthly' | 'quarterly' | 'annual'; subscribers: number
}
interface Tip {
  id: string; sport: string; event: string; market: string; odds: number; units: number; result: TipResult; date: string; profit?: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUBSCRIBERS: Subscriber[] = [
  { id: '1', name: 'Carlos Mendes', telegram: '@carlosm', plan: 'VIP Mensal', status: 'active', nextBilling: '2026-10-15', joinedAt: '2026-08-15', amount: 39.90 },
  { id: '2', name: 'Ana Paula Silva', telegram: '@anapaula', plan: 'VIP Mensal', status: 'active', nextBilling: '2026-10-18', joinedAt: '2026-08-18', amount: 39.90 },
  { id: '3', name: 'Bruno Ferreira', telegram: '@brunof', plan: 'Premium Trimestral', status: 'delinquent', nextBilling: '2026-09-01', joinedAt: '2026-06-01', amount: 99.90 },
  { id: '4', name: 'Mariana Costa', telegram: '@marianac', plan: 'VIP Mensal', status: 'active', nextBilling: '2026-10-20', joinedAt: '2026-08-20', amount: 39.90 },
  { id: '5', name: 'Lucas Oliveira', telegram: '@lucasoliv', plan: 'Premium Trimestral', status: 'active', nextBilling: '2026-11-05', joinedAt: '2026-08-05', amount: 99.90 },
  { id: '6', name: 'Fernanda Lima', telegram: '@fernandalima', plan: 'VIP Mensal', status: 'cancelled', nextBilling: '—', joinedAt: '2026-07-10', amount: 0 },
  { id: '7', name: 'Ricardo Santos', telegram: '@ricardos', plan: 'Anual Elite', status: 'active', nextBilling: '2027-05-12', joinedAt: '2025-05-12', amount: 399.90 },
  { id: '8', name: 'Tatiane Rocha', telegram: '@tatianer', plan: 'VIP Mensal', status: 'active', nextBilling: '2026-10-22', joinedAt: '2026-09-22', amount: 39.90 },
  { id: '9', name: 'Felipe Cardoso', telegram: '@felipec', plan: 'Premium Trimestral', status: 'delinquent', nextBilling: '2026-09-10', joinedAt: '2026-06-10', amount: 99.90 },
  { id: '10', name: 'Priscila Nunes', telegram: '@priscilan', plan: 'VIP Mensal', status: 'active', nextBilling: '2026-10-25', joinedAt: '2026-09-25', amount: 39.90 },
]

const TIPS: Tip[] = [
  { id: '1', sport: 'Futebol', event: 'Flamengo x Palmeiras', market: 'Ambas Marcam – Sim', odds: 1.85, units: 2, result: 'green', date: '2026-09-20', profit: 1.70 },
  { id: '2', sport: 'Futebol', event: 'Real Madrid x Bayern', market: 'Dupla Chance 1X', odds: 1.45, units: 3, result: 'green', date: '2026-09-18', profit: 1.35 },
  { id: '3', sport: 'Tênis', event: 'Djokovic x Alcaraz – US Open', market: 'Alcaraz Vence Set 1', odds: 2.40, units: 1, result: 'red', date: '2026-09-15', profit: -1.00 },
  { id: '4', sport: 'Futebol', event: 'Liverpool x Arsenal', market: 'Over 2.5 Gols', odds: 1.90, units: 2, result: 'green', date: '2026-09-13', profit: 1.80 },
  { id: '5', sport: 'Basquete', event: 'Lakers x Warriors – NBA', market: 'Handicap Lakers -3.5', odds: 1.95, units: 1, result: 'void', date: '2026-09-10', profit: 0 },
  { id: '6', sport: 'Futebol', event: 'São Paulo x Corinthians', market: 'BTTS + Over 2.5', odds: 2.60, units: 1, result: 'green', date: '2026-09-08', profit: 1.60 },
  { id: '7', sport: 'Futebol', event: 'Manchester City x Chelsea', market: 'Gols H1 Over 1.5', odds: 1.75, units: 2, result: 'red', date: '2026-09-05', profit: -2.00 },
  { id: '8', sport: 'Futebol', event: 'Atlético MG x Grêmio', market: 'Ganhador Atletico MG', odds: 1.65, units: 3, result: 'green', date: '2026-09-03', profit: 1.95 },
]

const MRR_HISTORY = [
  { month: 'Abr', value: 780 }, { month: 'Mai', value: 1040 }, { month: 'Jun', value: 1250 },
  { month: 'Jul', value: 1480 }, { month: 'Ago', value: 1820 }, { month: 'Set', value: 2190 },
]
const CHURN_HISTORY = [
  { month: 'Abr', value: 3 }, { month: 'Mai', value: 2 }, { month: 'Jun', value: 5 },
  { month: 'Jul', value: 1 }, { month: 'Ago', value: 4 }, { month: 'Set', value: 2 },
]

// ─── Utils ────────────────────────────────────────────────────────────────────

function calcROI(tips: Tip[]) {
  const settled = tips.filter(t => t.result !== 'pending' && t.result !== 'void')
  const total = settled.reduce((s, t) => s + t.units, 0)
  const profit = settled.reduce((s, t) => s + (t.profit ?? 0), 0)
  const wins = settled.filter(t => t.result === 'green').length
  return {
    roi: total > 0 ? (profit / total) * 100 : 0,
    winRate: settled.length > 0 ? (wins / settled.length) * 100 : 0,
    profit,
    settled: settled.length,
    wins,
  }
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Badge({ status }: { status: SubscriberStatus }) {
  const cfg = {
    active: { cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', dot: 'bg-emerald-400', label: 'Ativo' },
    delinquent: { cls: 'bg-red-950/60 text-red-400 border-red-900/50', dot: 'bg-red-400', label: 'Inadimplente' },
    cancelled: { cls: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50', dot: 'bg-zinc-500', label: 'Cancelado' },
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function ResultBadge({ result }: { result: TipResult }) {
  const cfg = {
    green: { cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', label: '✓ Green' },
    red: { cls: 'bg-red-950/60 text-red-400 border-red-900/50', label: '✗ Red' },
    void: { cls: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50', label: '— Void' },
    pending: { cls: 'bg-amber-950/60 text-amber-400 border-amber-800/50', label: '⧗ Aguardando' },
  }[result]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input {...props} className={`bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full ${props.className ?? ''}`} />
    </div>
  )
}

function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <select {...props} className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all">
        {children}
      </select>
    </div>
  )
}

function Stat({ label, value, sub, color = 'neutral' }: { label: string; value: string; sub?: string; color?: 'green' | 'red' | 'neutral' }) {
  const val = color === 'green' ? 'text-emerald-400' : color === 'red' ? 'text-red-400' : 'text-zinc-100'
  return (
    <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 flex flex-col gap-2 hover:border-zinc-700/50 transition-colors">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-semibold font-mono tracking-tight ${val}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-600">{sub}</span>}
    </div>
  )
}

function Btn({ children, variant = 'primary', size = 'md', ...props }: {
  children: React.ReactNode; variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const v = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    ghost: 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300',
    danger: 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/50',
  }[variant]
  const s = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
  return <button {...props} className={`${base} ${v} ${s} ${props.className ?? ''}`}>{children}</button>
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  const icon = size === 'sm' ? 10 : size === 'lg' ? 18 : 13
  return (
    <div className={`${sz} rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30`}>
      <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none">
        <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="8" cy="8" r="2.5" fill="white" />
      </svg>
    </div>
  )
}

// ─── SCREEN 1 — ONBOARDING ───────────────────────────────────────────────────

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [tg, setTg] = useState({ token: '', channel: '' })
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [planForm, setPlanForm] = useState({ name: 'VIP Mensal', price: '39.90', period: 'monthly' as const })

  const steps = ['Sua Conta', 'Telegram', 'Primeiro Plano']
  const canAccount = form.name && form.email && form.password.length >= 6
  const canConnect = tg.token && tg.channel

  function doConnect() {
    setConnecting(true)
    setTimeout(() => { setConnecting(false); setConnected(true) }, 1800)
  }

  return (
    <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-12 relative">
        <Logo size="md" />
        <span className="text-xl font-bold text-zinc-100">Tipsfy</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10 relative">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                i < step ? 'bg-emerald-500 border-emerald-500 text-white' :
                i === step ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                'bg-transparent border-zinc-800 text-zinc-600'
              }`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i === step ? 'text-zinc-300' : i < step ? 'text-zinc-500' : 'text-zinc-700'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 h-px mx-2 mb-6 transition-all duration-500 ${i < step ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </nav>

      {/* Card */}
      <div className="w-full max-w-md bg-[#111114] border border-[#1e1e24] rounded-2xl p-8 relative shadow-2xl shadow-black/40">

        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Crie sua conta</h2>
              <p className="text-sm text-zinc-500 mt-1">Comece a gerenciar seus assinantes em minutos.</p>
            </div>
            <div className="flex flex-col gap-4">
              <Input label="Nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rafael Tipster" />
              <Input label="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rafael@exemplo.com" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Senha</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
                {form.password && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= (i + 1) * 3 ?
                          form.password.length >= 10 ? 'bg-emerald-500' : form.password.length >= 6 ? 'bg-amber-500' : 'bg-red-500' :
                          'bg-zinc-800'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Btn disabled={!canAccount} onClick={() => setStep(1)} className="w-full py-3">
                Continuar →
              </Btn>
              <p className="text-center text-xs text-zinc-600">
                Já tem conta? <button className="text-emerald-400 hover:text-emerald-300 transition-colors">Entrar</button>
              </p>
            </div>
          </div>
        )}

        {/* Step 1 — Telegram */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Conectar Telegram</h2>
              <p className="text-sm text-zinc-500 mt-1">Vincule o bot para automação completa de membros.</p>
            </div>

            <div className="bg-[#18181c] border border-[#1e1e24] rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Como obter o token</p>
              {[
                ['1', 'Abra o Telegram e busque', '@BotFather'],
                ['2', 'Envie o comando', '/newbot'],
                ['3', 'Siga as instruções e copie o token gerado', ''],
                ['4', 'Adicione o bot como admin do seu canal', ''],
              ].map(([n, text, code]) => (
                <div key={n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {text} {code && <span className="font-mono text-emerald-400">{code}</span>}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Token do Bot</label>
                <input
                  value={tg.token}
                  onChange={e => { setTg(t => ({ ...t, token: e.target.value })); setConnected(false) }}
                  placeholder="1234567890:AAHdIKv8..."
                  className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">ID ou @username do canal</label>
                <input
                  value={tg.channel}
                  onChange={e => { setTg(t => ({ ...t, channel: e.target.value })); setConnected(false) }}
                  placeholder="@SinaisFutebolVIP"
                  className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {connected && (
              <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Bot conectado com sucesso!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Canal <span className="font-mono">{tg.channel}</span> pronto para automação</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setStep(0)} className="flex-1">← Voltar</Btn>
              {connected
                ? <Btn onClick={() => setStep(2)} className="flex-1">Continuar →</Btn>
                : <Btn disabled={!canConnect || connecting} onClick={doConnect} className="flex-1">
                    {connecting
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg> Verificando...</>
                      : 'Verificar Conexão'}
                  </Btn>
              }
            </div>
          </div>
        )}

        {/* Step 2 — First Plan */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Seu primeiro plano</h2>
              <p className="text-sm text-zinc-500 mt-1">Configure como seus assinantes irão pagar.</p>
            </div>

            <div className="flex flex-col gap-4">
              <Input label="Nome do plano" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: VIP Mensal" />
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">R$</span>
                    <input type="number" step="0.01" value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))} placeholder="39,90" className="bg-[#18181c] border border-[#1e1e24] rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full" />
                  </div>
                </div>
                <Select label="Período" value={planForm.period} onChange={e => setPlanForm(f => ({ ...f, period: e.target.value as typeof f.period }))} className="flex-1">
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </Select>
              </div>
            </div>

            {/* Mini preview */}
            <div className="bg-[#08080a] border border-[#1e1e24] rounded-xl p-4">
              <p className="text-xs text-zinc-600 mb-3">Preview do card de checkout</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{planForm.name || 'Nome do plano'}</p>
                  <p className="text-xs text-zinc-500">Cobrança {planForm.period === 'monthly' ? 'mensal' : planForm.period === 'quarterly' ? 'trimestral' : 'anual'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-mono text-emerald-400">
                    R$ {planForm.price ? parseFloat(planForm.price).toFixed(2).replace('.', ',') : '—'}
                  </p>
                  <p className="text-xs text-zinc-600">/{planForm.period === 'monthly' ? 'mês' : planForm.period === 'quarterly' ? 'trim.' : 'ano'}</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg">Assinar agora via Pix / Cartão</button>
            </div>

            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setStep(1)} className="flex-1">← Voltar</Btn>
              <Btn onClick={onDone} className="flex-1">Acessar Dashboard 🎉</Btn>
            </div>
            <button onClick={onDone} className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Pular por agora</button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-700">© 2026 Tipsfy · Termos · Privacidade</p>
    </div>
  )
}

// ─── SCREEN 2 — PLANS ────────────────────────────────────────────────────────

function PlansScreen() {
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', name: 'VIP Mensal', price: 39.90, period: 'monthly', subscribers: 6 },
    { id: '2', name: 'Premium Trimestral', price: 99.90, period: 'quarterly', subscribers: 3 },
    { id: '3', name: 'Anual Elite', price: 299.90, period: 'annual', subscribers: 1 },
  ])
  const [form, setForm] = useState({ name: '', price: '', period: 'monthly' as Plan['period'] })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewPlan, setPreviewPlan] = useState(plans[0])

  const PERIOD_LABEL = { monthly: 'Mensal', quarterly: 'Trimestral', annual: 'Anual' }
  const PERIOD_SHORT = { monthly: 'mês', quarterly: 'trim.', annual: 'ano' }
  const PERIOD_DISCOUNT = { monthly: '', quarterly: 'Economize 16%', annual: 'Economize 33%' }

  function addPlan() {
    if (!form.name || !form.price) return
    const p: Plan = { id: Date.now().toString(), name: form.name, price: parseFloat(form.price), period: form.period, subscribers: 0 }
    setPlans(prev => [...prev, p])
    setPreviewPlan(p)
    setForm({ name: '', price: '', period: 'monthly' })
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`https://tipsfy.io/checkout/${id}`).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function deletePlan(id: string) {
    setDeletingId(id)
    setTimeout(() => {
      setPlans(prev => prev.filter(p => p.id !== id))
      setDeletingId(null)
      setPreviewPlan(p => p.id === id ? plans.find(pl => pl.id !== id) ?? plans[0] : p)
    }, 300)
  }

  const totalMRR = plans.reduce((s, p) => {
    const monthly = p.period === 'monthly' ? p.price : p.period === 'quarterly' ? p.price / 3 : p.price / 12
    return s + monthly * p.subscribers
  }, 0)

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 lg:px-0">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Planos de Assinatura</h1>
          <p className="text-sm text-zinc-500 mt-1">Crie e gerencie os planos disponíveis para seus assinantes.</p>
        </div>
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">MRR Total</p>
          <p className="text-xl font-bold font-mono text-emerald-400">R$ {fmtBRL(totalMRR)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-8">
        {/* Form */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-6">
          <h2 className="font-semibold text-zinc-100 mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">+</span>
            Novo Plano
          </h2>
          <div className="flex flex-col gap-4">
            <Input label="Nome do plano" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: VIP Mensal, Gold, Premium..." />
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-zinc-400">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">R$</span>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="39,90" className="bg-[#18181c] border border-[#1e1e24] rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full" />
                </div>
              </div>
              <Select label="Periodicidade" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value as Plan['period'] }))}>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </Select>
            </div>

            {form.name && form.price && (
              <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-lg p-3 flex items-center gap-3">
                <span className="text-emerald-400 text-xs">◆</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-300">{form.name}</p>
                  <p className="text-xs text-zinc-600">R$ {parseFloat(form.price || '0').toFixed(2).replace('.', ',')} · {PERIOD_LABEL[form.period]}</p>
                </div>
                {PERIOD_DISCOUNT[form.period] && (
                  <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">{PERIOD_DISCOUNT[form.period]}</span>
                )}
              </div>
            )}

            <Btn disabled={!form.name || !form.price} onClick={addPlan} className="w-full py-3 mt-1">
              Criar Plano
            </Btn>
          </div>
        </div>

        {/* Checkout Preview */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="text-zinc-600 text-xs">◎</span> Preview do Checkout
            </h2>
            <div className="flex gap-1">
              {plans.map(p => (
                <button key={p.id} onClick={() => setPreviewPlan(p)} className={`px-2 py-1 rounded text-xs transition-colors ${previewPlan.id === p.id ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated checkout card */}
          <div className="bg-[#08080a] border border-[#1e1e24] rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-950/30 to-transparent px-5 pt-5 pb-4 border-b border-[#1e1e24]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow shadow-emerald-500/30">R</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Rafael Tipster</p>
                  <p className="text-xs text-zinc-500 font-mono">@SinaisFutebolVIP</p>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-zinc-100">{previewPlan.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Assinatura recorrente · Cancele quando quiser</p>
                  {PERIOD_DISCOUNT[previewPlan.period] && (
                    <span className="inline-block mt-2 text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-full px-2.5 py-0.5">
                      {PERIOD_DISCOUNT[previewPlan.period]}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-emerald-400">R$ {fmtBRL(previewPlan.price)}</p>
                  <p className="text-xs text-zinc-600">/{PERIOD_SHORT[previewPlan.period]}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs font-medium text-zinc-500 mb-2">Forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2">
                {[['⚡ Pix', 'Aprovação imediata'], ['💳 Cartão', 'Até 12x sem juros']].map(([label, sub]) => (
                  <div key={label} className="bg-[#111114] border border-[#1e1e24] rounded-lg p-3 cursor-pointer hover:border-zinc-700 transition-colors">
                    <p className="text-xs font-semibold text-zinc-200">{label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow shadow-emerald-500/20">
                Assinar agora
              </button>
              <p className="text-center text-xs text-zinc-700">🔒 Pagamento seguro via Tipsfy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div>
        <h2 className="font-semibold text-zinc-100 mb-4">Planos cadastrados</h2>
        {plans.length === 0 ? (
          <div className="bg-[#111114] border border-dashed border-[#1e1e24] rounded-2xl p-12 text-center">
            <p className="text-zinc-600 text-sm">Nenhum plano criado ainda. Crie seu primeiro plano acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-[#111114] border border-[#1e1e24] rounded-2xl p-5 hover:border-zinc-700/60 transition-all ${deletingId === plan.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                style={{ transition: 'opacity 0.3s, transform 0.3s' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-zinc-100">{plan.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{PERIOD_LABEL[plan.period]}</p>
                  </div>
                  <button onClick={() => deletePlan(plan.id)} className="text-zinc-700 hover:text-red-400 transition-colors p-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3V3.5M6 6.5v4M8 6.5v4M3 3.5l.667 7.333A.667.667 0 004.333 11.5h5.334a.667.667 0 00.666-.667L11 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>

                <p className="text-2xl font-bold font-mono text-emerald-400 mb-1">R$ {fmtBRL(plan.price)}</p>
                <p className="text-xs text-zinc-600 mb-4">{plan.subscribers} assinante{plan.subscribers !== 1 ? 's' : ''} ativos</p>

                <div className="flex flex-col gap-2">
                  <button onClick={() => copyLink(plan.id)} className="w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    {copiedId === plan.id
                      ? <><span className="text-emerald-400">✓</span> Link copiado!</>
                      : <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2h6v6M2 4h6v6H2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> Copiar link de checkout</>
                    }
                  </button>
                  <button onClick={() => setPreviewPlan(plan)} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1">
                    Ver preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SCREEN 3 — DASHBOARD ────────────────────────────────────────────────────

function DashboardScreen() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | 'all'>('all')
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>(SUBSCRIBERS)

  const active = subscribers.filter(s => s.status === 'active').length
  const delinquent = subscribers.filter(s => s.status === 'delinquent').length
  const cancelled = subscribers.filter(s => s.status === 'cancelled').length
  const mrr = subscribers.filter(s => s.status === 'active').reduce((s, sub) => s + sub.amount / (sub.plan.includes('Trimestral') ? 3 : sub.plan.includes('Anual') ? 12 : 1), 0)
  const churn = ((cancelled / subscribers.length) * 100).toFixed(1)

  const filtered = subscribers.filter(s => {
    const q = search.toLowerCase()
    const matchQ = s.name.toLowerCase().includes(q) || s.telegram.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || s.status === statusFilter
    return matchQ && matchS
  })

  function toggleStatus(id: string) {
    setSubscribers(prev => prev.map(s => {
      if (s.id !== id) return s
      return { ...s, status: s.status === 'active' ? 'cancelled' : 'active' }
    }))
    setActionMenu(null)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        <p className="text-emerald-400 font-mono font-semibold">R$ {fmtBRL(payload[0].value)}</p>
      </div>
    )
  }

  const ChurnTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        <p className="text-red-400 font-mono font-semibold">{payload[0].value} cancelamentos</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 lg:px-0" onClick={() => setActionMenu(null)}>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Visão geral do seu negócio · Set 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 bg-zinc-900 border border-[#1e1e24] px-3 py-1.5 rounded-full">
            Último sync: há 2 min
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="MRR Atual" value={`R$ ${fmtBRL(mrr)}`} sub="+18% vs mês anterior" color="green" />
        <Stat label="Assinantes Ativos" value={`${active}`} sub={`de ${subscribers.length} total`} />
        <Stat label="Taxa de Churn" value={`${churn}%`} sub="últimos 30 dias" />
        <Stat label="Inadimplência" value={`${delinquent}`} sub={delinquent > 0 ? `R$ ${fmtBRL(delinquent * 39.90)} em risco` : 'Tudo em dia ✓'} color={delinquent > 0 ? 'red' : 'neutral'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-[#111114] border border-[#1e1e24] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Crescimento do MRR</p>
              <p className="text-xs text-zinc-500">Últimos 6 meses</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/30 px-2.5 py-1 rounded-full font-medium">+181% YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MRR_HISTORY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#mrrGrad)" dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-zinc-100">Cancelamentos</p>
            <p className="text-xs text-zinc-500">Por mês</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHURN_HISTORY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChurnTooltip />} />
              <Bar dataKey="value" fill="#ef4444" opacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscriber Table */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e24] flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="font-semibold text-zinc-100 whitespace-nowrap">Assinantes</h2>
            <span className="text-xs text-zinc-600 bg-zinc-900 border border-[#1e1e24] px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-[#18181c] border border-[#1e1e24] rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 transition-all w-full sm:w-48" />
            </div>
            <div className="flex gap-1">
              {(['all', 'active', 'delinquent', 'cancelled'] as const).map(s => {
                const counts = { all: subscribers.length, active, delinquent, cancelled }
                const labels = { all: 'Todos', active: 'Ativos', delinquent: 'Inad.', cancelled: 'Cancel.' }
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${statusFilter === s ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/50'}`}>
                    {labels[s]}
                    <span className={`text-xs ${statusFilter === s ? 'text-zinc-400' : 'text-zinc-700'}`}>{counts[s]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-[#1e1e24] flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">Nenhum assinante encontrado</p>
            <p className="text-xs text-zinc-700">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e24]">
                  {['Assinante', 'Plano', 'Status', 'Próx. Cobrança', 'Valor', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <tr key={sub.id} className={`border-b border-[#1e1e24]/40 hover:bg-[#18181c]/50 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                          {sub.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100 whitespace-nowrap">{sub.name}</p>
                          <p className="text-xs text-zinc-600 font-mono">{sub.telegram}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">{sub.plan}</td>
                    <td className="px-4 py-3.5"><Badge status={sub.status} /></td>
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-500 whitespace-nowrap">{sub.nextBilling}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-300 whitespace-nowrap">
                      {sub.amount > 0 ? `R$ ${fmtBRL(sub.amount)}` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setActionMenu(actionMenu === sub.id ? null : sub.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="2" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="7" cy="12" r="1.2"/></svg>
                        </button>
                        {actionMenu === sub.id && (
                          <div className="absolute right-0 top-8 z-20 w-48 bg-[#18181c] border border-[#1e1e24] rounded-xl shadow-xl overflow-hidden">
                            <button onClick={() => toggleStatus(sub.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors text-left">
                              {sub.status === 'active' ? '🔒 Bloquear acesso' : '🔓 Reativar acesso'}
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors text-left">
                              📩 Reenviar link de acesso
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors text-left">
                              💸 Marcar como pago
                            </button>
                            <div className="border-t border-[#1e1e24]">
                              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left">
                                🗑 Remover assinante
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e24] flex items-center justify-between">
            <p className="text-xs text-zinc-600">Mostrando {filtered.length} de {subscribers.length} assinantes</p>
            <div className="flex gap-1">
              {[1, 2].map(p => (
                <button key={p} className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === 1 ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SCREEN 4 — TIPS ─────────────────────────────────────────────────────────

function TipsScreen() {
  const [tips, setTips] = useState<Tip[]>(TIPS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ sport: 'Futebol', event: '', market: '', odds: '', units: '1', result: 'pending' as TipResult })
  const [filter, setFilter] = useState<TipResult | 'all'>('all')

  const stats = calcROI(tips)
  const filtered = filter === 'all' ? tips : tips.filter(t => t.result === filter)

  const roiHistory = tips
    .filter(t => t.result !== 'pending')
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce<{ date: string; roi: number }[]>((acc, t, i, arr) => {
      const prev = acc[acc.length - 1]?.roi ?? 0
      const prevUnits = arr.slice(0, i + 1).filter(x => x.result !== 'void').reduce((s, x) => s + x.units, 0)
      const prevProfit = arr.slice(0, i + 1).reduce((s, x) => s + (x.profit ?? 0), 0)
      const roi = prevUnits > 0 ? (prevProfit / prevUnits) * 100 : prev
      acc.push({ date: t.date.slice(5), roi: parseFloat(roi.toFixed(1)) })
      return acc
    }, [])

  function submitTip() {
    if (!form.event || !form.odds || !form.units) return
    const odds = parseFloat(form.odds)
    const units = parseFloat(form.units)
    const profit = form.result === 'green' ? units * (odds - 1) : form.result === 'red' ? -units : 0

    if (editingId) {
      setTips(prev => prev.map(t => t.id === editingId ? { ...t, ...form, odds, units, profit } : t))
      setEditingId(null)
    } else {
      setTips(prev => [{ id: Date.now().toString(), ...form, odds, units, profit, date: new Date().toISOString().split('T')[0] }, ...prev])
    }
    setShowModal(false)
    setForm({ sport: 'Futebol', event: '', market: '', odds: '', units: '1', result: 'pending' })
  }

  function openEdit(tip: Tip) {
    setForm({ sport: tip.sport, event: tip.event, market: tip.market, odds: tip.odds.toString(), units: tip.units.toString(), result: tip.result })
    setEditingId(tip.id)
    setShowModal(true)
  }

  const RoiTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const v = payload[0].value
    return (
      <div className="bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2 text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        <p className={`font-mono font-semibold ${v >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{v >= 0 ? '+' : ''}{v}%</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 lg:px-0">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tips & Performance</h1>
          <p className="text-sm text-zinc-500 mt-1">Registre análises e construa prova social verificada.</p>
        </div>
        <Btn onClick={() => { setEditingId(null); setForm({ sport: 'Futebol', event: '', market: '', odds: '', units: '1', result: 'pending' }); setShowModal(true) }}>
          + Nova Tip
        </Btn>
      </div>
    </aside>
  )
}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="ROI Acumulado" value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`} sub={`${stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}u de lucro`} color={stats.roi >= 0 ? 'green' : 'red'} />
        <Stat label="Taxa de Acerto" value={`${stats.winRate.toFixed(0)}%`} sub={`${stats.wins}/${stats.settled} tips`} />
        <Stat label="Tips Totais" value={`${tips.length}`} sub={`${tips.filter(t => t.result === 'pending').length} aguardando resultado`} />
        <Stat label="Odd Média" value={tips.length ? (tips.reduce((s, t) => s + t.odds, 0) / tips.length).toFixed(2) : '—'} sub="entrada média" />
      </div>

      {/* ROI Chart */}
      {roiHistory.length > 1 && (
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-100">Evolução do ROI</p>
            <span className={`text-xs font-mono font-semibold ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}% acumulado
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={roiHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<RoiTooltip />} />
              <Area type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} fill="url(#roiGrad)" dot={{ fill: '#10b981', r: 2.5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tips Table */}
      <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e24] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold text-zinc-100 text-sm">Histórico de Tips</h2>
          <div className="flex gap-1">
            {(['all', 'green', 'red', 'void', 'pending'] as const).map(f => {
              const count = f === 'all' ? tips.length : tips.filter(t => t.result === f).length
              const labels = { all: 'Todas', green: 'Green', red: 'Red', void: 'Void', pending: 'Aguardando' }
              return (
                <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-600 hover:text-zinc-300'}`}>
                  {labels[f]} <span className="opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-[#1e1e24] flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-700"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">Nenhuma tip {filter !== 'all' ? `com resultado "${filter}"` : 'registrada'}</p>
            {filter === 'all' && <Btn size="sm" onClick={() => setShowModal(true)}>Registrar primeira tip</Btn>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e24]">
                  {['Data', 'Esporte', 'Evento / Mercado', 'Odd', 'Un.', 'P/L', 'Resultado', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tip, i) => (
                  <tr key={tip.id} className={`border-b border-[#1e1e24]/40 hover:bg-[#18181c]/50 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3.5 text-xs font-mono text-zinc-600 whitespace-nowrap">{tip.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-zinc-900 border border-[#1e1e24] text-zinc-400 px-2 py-1 rounded-md whitespace-nowrap">{tip.sport}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-zinc-200 font-medium truncate">{tip.event}</p>
                      {tip.market && <p className="text-xs text-zinc-600 truncate">{tip.market}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-300 whitespace-nowrap">{tip.odds.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-500 whitespace-nowrap">{tip.units}u</td>
                    <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                      {tip.result === 'pending' ? <span className="text-zinc-600">—</span> :
                        <span className={tip.profit! >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {tip.profit! >= 0 ? '+' : ''}{tip.profit?.toFixed(2)}u
                        </span>
                      }
                    </td>
                    <td className="px-4 py-3.5"><ResultBadge result={tip.result} /></td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => openEdit(tip)} className="text-zinc-700 hover:text-zinc-400 transition-colors p-1">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L4 11H2V9L9 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-zinc-100">{editingId ? 'Editar Tip' : 'Registrar Nova Tip'}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Preencha os detalhes da análise</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Esporte" value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                  {['Futebol', 'Tênis', 'Basquete', 'Vôlei', 'MMA', 'Outros'].map(s => <option key={s}>{s}</option>)}
                </Select>
                <Select label="Resultado" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value as TipResult }))}>
                  <option value="pending">Aguardando</option>
                  <option value="green">✓ Green</option>
                  <option value="red">✗ Red</option>
                  <option value="void">— Void</option>
                </Select>
              </div>

              <Input label="Evento" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} placeholder="Ex: Flamengo x Palmeiras – Brasileirão" />
              <Input label="Mercado / Tipo de aposta" value={form.market} onChange={e => setForm(f => ({ ...f, market: e.target.value }))} placeholder="Ex: Ambas Marcam – Sim" />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Odd" type="number" step="0.01" value={form.odds} onChange={e => setForm(f => ({ ...f, odds: e.target.value }))} placeholder="2.10" className="font-mono" />
                <Input label="Unidades" type="number" step="0.5" value={form.units} onChange={e => setForm(f => ({ ...f, units: e.target.value }))} placeholder="1" className="font-mono" />
              </div>

              {form.odds && form.units && form.result !== 'pending' && (
                <div className="bg-zinc-900/50 border border-zinc-800/40 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Resultado estimado</span>
                  <span className={`text-sm font-mono font-semibold ${form.result === 'green' ? 'text-emerald-400' : form.result === 'red' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {form.result === 'green' ? `+${(parseFloat(form.units) * (parseFloat(form.odds) - 1)).toFixed(2)}u` : form.result === 'red' ? `-${form.units}u` : '0u (devolvido)'}
                  </span>
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <Btn variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Btn>
                <Btn disabled={!form.event || !form.odds || !form.units} onClick={submitTip} className="flex-1">
                  {editingId ? 'Salvar alterações' : 'Registrar Tip'}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── SCREEN 5 — PUBLIC PAGE ───────────────────────────────────────────────────

function PublicScreen() {
  const { roi, winRate, wins, settled } = calcROI(TIPS)
  const publicTips = TIPS.filter(t => t.result !== 'pending')
  const [activeTab, setActiveTab] = useState<'tips' | 'stats'>('tips')
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  const plans = [
    { name: 'VIP Mensal', price: 39.90, period: 'mês', popular: false },
    { name: 'Premium Trimestral', price: 99.90, period: 'trim.', popular: true, savings: 'Economize R$ 20' },
    { name: 'Anual Elite', price: 299.90, period: 'ano', popular: false, savings: 'Economize R$ 179' },
  ]

  const sportBreakdown = TIPS.reduce<Record<string, { count: number; wins: number }>>((acc, t) => {
    if (!acc[t.sport]) acc[t.sport] = { count: 0, wins: 0 }
    acc[t.sport].count++
    if (t.result === 'green') acc[t.sport].wins++
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#08080a]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="border-b border-[#1e1e24] bg-[#0c0c0f]/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm font-semibold text-zinc-400">Tipsfy</span>
          </div>
          <button onClick={() => setSubscribeOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow shadow-emerald-500/20">
            Assinar Grupo VIP
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 py-14 text-center relative">
          <div className="relative inline-block mb-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-500/30">
              R
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#08080a] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-zinc-100 mb-1">Rafael Tipster</h1>
          <p className="text-sm font-mono text-emerald-500 mb-3">@SinaisFutebolVIP</p>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed mb-5">
            Análises profissionais de futebol e tênis com histórico 100% verificado e transparente. Sem promessas fantasiosas.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['⚽ Futebol', '🎾 Tênis', '🏀 Basquete', '📊 Verificado', '3+ anos'].map(t => (
              <span key={t} className="text-xs bg-zinc-900 border border-[#1e1e24] text-zinc-400 px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-[#1e1e24] bg-[#0c0c0f]">
        <div className="max-w-2xl mx-auto px-4 py-5 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'ROI 30d', value: `+${roi.toFixed(1)}%`, color: 'text-emerald-400' },
            { label: 'Acerto global', value: `${winRate.toFixed(0)}%`, color: 'text-zinc-100' },
            { label: 'Greens', value: `${wins}/${settled}`, color: 'text-zinc-100' },
            { label: 'Tips pub.', value: `${publicTips.length}`, color: 'text-zinc-100' },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#111114] border border-[#1e1e24] rounded-xl p-1 mb-6">
          {(['tips', 'stats'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {tab === 'tips' ? '📋 Histórico de Tips' : '📊 Estatísticas'}
            </button>
          ))}
        </div>

        {activeTab === 'tips' && (
          <div className="flex flex-col gap-3">
            {publicTips.map(tip => (
              <div key={tip.id} className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs bg-zinc-900 border border-[#1e1e24] text-zinc-500 px-2 py-0.5 rounded">{tip.sport}</span>
                      <span className="text-xs text-zinc-600 font-mono">{tip.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100 truncate">{tip.event}</p>
                    {tip.market && <p className="text-xs text-zinc-500 mt-0.5">{tip.market}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-mono text-zinc-400">@{tip.odds.toFixed(2)}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs font-mono text-zinc-500">{tip.units}u</span>
                      {tip.profit !== undefined && tip.result !== 'void' && (
                        <>
                          <span className="text-xs text-zinc-600">·</span>
                          <span className={`text-xs font-mono font-semibold ${tip.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tip.profit >= 0 ? '+' : ''}{tip.profit.toFixed(2)}u
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ResultBadge result={tip.result} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-4">
            {/* Results breakdown */}
            <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-100 mb-4">Distribuição de Resultados</p>
              <div className="space-y-3">
                {[
                  { label: 'Green', count: TIPS.filter(t => t.result === 'green').length, total: settled, color: 'bg-emerald-500' },
                  { label: 'Red', count: TIPS.filter(t => t.result === 'red').length, total: settled, color: 'bg-red-500' },
                  { label: 'Void', count: TIPS.filter(t => t.result === 'void').length, total: settled, color: 'bg-zinc-600' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 w-10">{row.label}</span>
                    <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${(row.count / row.total) * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono text-zinc-400 w-16 text-right">{row.count} ({((row.count / row.total) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By sport */}
            <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-100 mb-4">Por Esporte</p>
              <div className="space-y-3">
                {Object.entries(sportBreakdown).map(([sport, data]) => (
                  <div key={sport} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{sport}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{data.count} tips</span>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        data.wins / data.count >= 0.5 ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50' : 'text-red-400 bg-red-950/50 border-red-900/50'
                      }`}>
                        {((data.wins / data.count) * 100).toFixed(0)}% acerto
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="bg-[#08080a]/95 backdrop-blur border-t border-[#1e1e24] px-4 py-4">
          <div className="max-w-2xl mx-auto">
            {!subscribeOpen ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-zinc-100">Acesso ao Grupo VIP</p>
                  <p className="text-xs text-zinc-500">+{TIPS.filter(t => t.result === 'green').length} greens comprovados este mês</p>
                </div>
                <button onClick={() => setSubscribeOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg shadow-emerald-500/25">
                  Assinar — R$ 39,90/mês
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-100">Escolha seu plano</p>
                  <button onClick={() => setSubscribeOpen(false)} className="text-zinc-600 hover:text-zinc-400 text-xs">fechar ✕</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map(plan => (
                    <button key={plan.name} className={`relative p-3 rounded-xl border text-left transition-all hover:border-emerald-500/50 ${plan.popular ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-[#1e1e24] bg-[#111114]'}`}>
                      {plan.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Popular</span>
                      )}
                      <p className="text-xs font-semibold text-zinc-200 mb-1">{plan.name.split(' ')[0]}</p>
                      <p className="text-sm font-bold font-mono text-emerald-400">R$ {fmtBRL(plan.price)}</p>
                      <p className="text-xs text-zinc-600">/{plan.period}</p>
                      {plan.savings && <p className="text-xs text-emerald-500 mt-1">{plan.savings}</p>}
                    </button>
                  ))}
                </div>
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                  Assinar agora via Pix / Cartão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'dashboard' as Screen, label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
  )},
  { id: 'plans' as Screen, label: 'Planos', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4.5V8C2 11 5 13.5 8 14.5C11 13.5 14 11 14 8V4.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
  )},
  { id: 'tips' as Screen, label: 'Tips', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12L5 7L8 9L11 4L14 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { id: 'public' as Screen, label: 'Página Pública', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 2C8 2 6 5 6 8C6 11 8 14 8 14" stroke="currentColor" strokeWidth="1.3"/><path d="M2 8H14" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 5.5H13.5M2.5 10.5H13.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1"/></svg>
  )},
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [mobileNav, setMobileNav] = useState(false)

  if (screen === 'onboarding') return <OnboardingScreen onDone={() => setScreen('dashboard')} />

  return (
    <div className="min-h-screen bg-[#08080a] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-[#1e1e24] bg-[#0c0c0f] fixed h-full z-30">
        <div className="px-5 h-14 border-b border-[#1e1e24] flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="font-bold text-zinc-100">Tipsfy</span>
          <span className="ml-auto text-xs text-zinc-700 bg-zinc-900 border border-[#1e1e24] px-1.5 py-0.5 rounded font-mono">β</span>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest px-3 mb-2">Gestão</p>
          <nav className="space-y-0.5">
            {NAV.map(item => (
              <button key={item.id} onClick={() => setScreen(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                screen === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/30'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}>
                <span className={`transition-colors ${screen === item.id ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4 border-t border-[#1e1e24] space-y-1">
          <div className="px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-[#1e1e24]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">R</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">Rafael Tipster</p>
                <p className="text-xs text-zinc-600 font-mono truncate">@SinaisFutebolVIP</p>
              </div>
            </div>
          </div>
          <button onClick={() => setScreen('onboarding')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/30 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2H2.5C2.2 2 2 2.2 2 2.5v8c0 .3.2.5.5.5H5M9 9.5L11.5 7 9 4.5M11.5 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#0c0c0f]/95 backdrop-blur border-b border-[#1e1e24] h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-sm font-bold text-zinc-100">Tipsfy</span>
        </div>
        <button onClick={() => setMobileNav(v => !v)} className="text-zinc-400 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h12M3 9h12M3 13h12" strokeLinecap="round"/></svg>
        </button>
      </header>

      {/* Mobile nav overlay */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileNav(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-64 bg-[#0c0c0f] border-l border-[#1e1e24]" onClick={e => e.stopPropagation()}>
            <div className="h-12 border-b border-[#1e1e24] flex items-center justify-between px-4">
              <span className="text-sm font-bold text-zinc-100">Menu</span>
              <button onClick={() => setMobileNav(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">✕</button>
            </div>
            <nav className="px-3 py-4 space-y-0.5">
              {NAV.map(item => (
                <button key={item.id} onClick={() => { setScreen(item.id); setMobileNav(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${screen === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-200'}`}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-[#1e1e24] px-3 py-4">
              <div className="px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-[#1e1e24] mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">R</div>
                  <div><p className="text-xs font-semibold text-zinc-200">Rafael Tipster</p><p className="text-xs text-zinc-600">@SinaisFutebolVIP</p></div>
                </div>
              </div>
              <button onClick={() => { setScreen('onboarding'); setMobileNav(false) }} className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2">Sair da conta</button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 pt-12 lg:pt-0 min-h-screen overflow-x-hidden">
        {screen === 'dashboard' && <DashboardScreen />}
        {screen === 'plans' && <PlansScreen />}
        {screen === 'tips' && <TipsScreen />}
        {screen === 'public' && <PublicScreen />}
      </main>
    </div>
  )
}
