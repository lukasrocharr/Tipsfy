import type { SubscriberStatus, TipResult, TransactionStatus } from '../data'

export function Badge({ status }: { status: SubscriberStatus }) {
  const cfg = {
    active: { cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', dot: 'bg-emerald-400', label: 'Ativo' },
    delinquent: { cls: 'bg-red-950/60 text-red-400 border-red-900/50', dot: 'bg-red-400', label: 'Inadimplente' },
    cancelled: { cls: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50', dot: 'bg-zinc-500', label: 'Cancelado' },
    trial: { cls: 'bg-amber-950/60 text-amber-400 border-amber-800/50', dot: 'bg-amber-400', label: 'Trial' },
  }
  const { cls, dot, label } = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  )
}

export function ResultBadge({ result }: { result: TipResult }) {
  const cfg = {
    green: { cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', label: '✓ Green' },
    red: { cls: 'bg-red-950/60 text-red-400 border-red-900/50', label: '✗ Red' },
    void: { cls: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50', label: '— Void' },
    pending: { cls: 'bg-amber-950/60 text-amber-400 border-amber-800/50', label: '⧗ Pendente' },
  }
  const { cls, label } = cfg[result]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${cls}`}>{label}</span>
}

export function TxBadge({ status }: { status: TransactionStatus }) {
  const cfg = {
    paid: { cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', label: 'Pago' },
    pending: { cls: 'bg-amber-950/60 text-amber-400 border-amber-800/50', label: 'Pendente' },
    failed: { cls: 'bg-red-950/60 text-red-400 border-red-900/50', label: 'Falhou' },
    refunded: { cls: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50', label: 'Reembolsado' },
  }
  const { cls, label } = cfg[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>
}

export function MetricCard({ label, value, sub, trend, accent = false, negative = false }: {
  label: string; value: string; sub?: string; trend?: string; accent?: boolean; negative?: boolean
}) {
  const trendPositive = trend?.startsWith('+')
  return (
    <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-700/40 transition-colors group">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-semibold font-mono tracking-tight ${accent ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-zinc-100'}`}>
        {value}
      </span>
      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {trend && <span className={`text-xs font-medium ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</span>}
          {sub && <span className="text-xs text-zinc-600">{sub}</span>}
        </div>
      )}
    </div>
  )
}

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400">{label}</label>}
      <input {...props} className={`bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full ${props.className ?? ''}`} />
    </div>
  )
}

export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400">{label}</label>}
      <select {...props} className={`bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer ${props.className ?? ''}`}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400">{label}</label>}
      <textarea {...props} className={`bg-[#18181c] border border-[#1e1e24] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none ${props.className ?? ''}`} />
    </div>
  )
}

export function Btn({ variant = 'primary', size = 'md', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const v = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-40',
    secondary: 'bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300 border border-[#1e1e24]',
    danger: 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/40',
    ghost: 'hover:bg-zinc-800/40 text-zinc-500 hover:text-zinc-300',
  }
  const s = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  return (
    <button {...props} className={`rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 ${v[variant]} ${s[size]} ${props.className ?? ''}`}>
      {children}
    </button>
  )
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-emerald-700', 'bg-blue-700', 'bg-violet-700', 'bg-orange-700', 'bg-pink-700', 'bg-cyan-700']
  const color = colors[name.charCodeAt(0) % colors.length]
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  return <div className={`rounded-full ${color} flex items-center justify-center font-semibold text-white flex-shrink-0 ${sz[size]}`}>{initials}</div>
}

export function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-full bg-zinc-900 border border-[#1e1e24] flex items-center justify-center text-zinc-600">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      {sub && <p className="text-xs text-zinc-600 text-center max-w-xs">{sub}</p>}
    </div>
  )
}

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
        {sub && <p className="text-sm text-zinc-500 mt-1">{sub}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#111114] border border-[#1e1e24] rounded-xl ${className}`}>{children}</div>
}
