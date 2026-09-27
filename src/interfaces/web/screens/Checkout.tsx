'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, LoaderCircle } from 'lucide-react'
import { Btn, Card, Input } from '../components/ui'

type CheckoutPlan = { name: string; price: number; period: 'monthly' | 'quarterly' | 'annual'; description?: string }

export default function Checkout({ planSlug }: { planSlug: string }) {
  const [plan, setPlan] = useState<CheckoutPlan | null>(null)
  const [form, setForm] = useState({ name: '', email: '', telegramUserId: '' })
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [pixQrCode, setPixQrCode] = useState('')
  const [deepLinkUrl, setDeepLinkUrl] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    void loadPlan()
  }, [planSlug])

  useEffect(() => {
    if (!paymentId || paymentStatus !== 'PENDING') return
    let active = true
    const poll = async () => {
      try {
        const response = await fetch(`/api/checkout/payments/${encodeURIComponent(paymentId)}`)
        if (!response.ok) return
        const body = await response.json() as { status: 'PENDING' | 'PAID' | 'FAILED' }
        if (active) setPaymentStatus(body.status)
      } catch {
        // Retry on the next interval while the payment remains pending.
      }
    }
    void poll()
    const interval = window.setInterval(() => void poll(), 3000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [paymentId, paymentStatus])

  async function loadPlan() {
    const response = await fetch(`/api/checkout/${planSlug}`)
    if (!response.ok) {
      setError('Plano não encontrado ou indisponível.')
      setLoading(false)
      return
    }
    const body = await response.json() as { plan: CheckoutPlan }
    setPlan(body.plan)
    setLoading(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPixQrCode('')
    setDeepLinkUrl('')
    setPaymentId('')
    setPaymentStatus(null)
    setCopied(false)
    setPaying(true)
    const response = await fetch(`/api/checkout/${planSlug}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, paymentMethod: 'pix' }),
    })
    const body = await response.json().catch(() => null) as { paymentId?: string; status?: 'PENDING'; pixQrCode?: string; deepLinkUrl?: string; message?: string } | null
    setPaying(false)
    if (!response.ok) {
      setError(body?.message ?? 'Não foi possível iniciar o pagamento.')
      return
    }
    if (body?.paymentId) {
      setPaymentId(body.paymentId)
      setPaymentStatus(body.status ?? 'PENDING')
    }
    if (body?.deepLinkUrl) setDeepLinkUrl(body.deepLinkUrl)
    if (body?.pixQrCode) {
      setPixQrCode(body.pixQrCode)
      return
    }
    setError('O Mercado Pago não retornou o código Pix para esta cobrança.')
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pixQrCode)
      setCopied(true)
    } catch {
      setError('Não foi possível copiar o código Pix.')
    }
  }

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm(current => ({ ...current, [key]: event.target.value }))
  const periodLabel = plan?.period === 'monthly' ? 'mês' : plan?.period === 'quarterly' ? 'trimestre' : 'ano'

  if (loading) return <main className="min-h-screen bg-[#08080a] flex items-center justify-center text-sm text-zinc-500">Carregando checkout...</main>
  if (!plan) return <main className="min-h-screen bg-[#08080a] flex items-center justify-center text-sm text-red-400">{error}</main>

  return <main className="min-h-screen bg-[#08080a] px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2.5 mb-8"><div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">◈</div><span className="font-bold text-zinc-100">Tipsfy</span></div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <Card className="p-6 lg:col-span-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Assinatura</p>
          <h1 className="text-2xl font-semibold text-zinc-100">Finalize seu acesso</h1>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Preencha seus dados para entrar no grupo.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome completo" value={form.name} onChange={update('name')} placeholder="Seu nome" required />
            <Input label="E-mail" type="email" value={form.email} onChange={update('email')} placeholder="voce@email.com" required />
            <Input label="Telegram (opcional)" value={form.telegramUserId} onChange={update('telegramUserId')} placeholder="@seuusuario ou ID" />
            <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/20 px-3 py-2.5 text-sm text-emerald-300">Pagamento via Pix</div>
            {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            <Btn className="w-full" disabled={paying}>{paying ? 'Processando...' : 'Assinar agora →'}</Btn>
          </form>
          {pixQrCode && <div className="mt-6 pt-6 border-t border-[#1e1e24] text-center"><p className="text-sm font-semibold text-zinc-100 mb-4">Escaneie o QR Code Pix</p><div className="inline-flex bg-white p-3 rounded-xl"><QRCodeSVG value={pixQrCode} size={180} /></div><label className="mt-4 block text-left text-xs font-medium text-zinc-400">Pix copia e cola<textarea readOnly value={pixQrCode} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-[#303036] bg-[#111114] p-3 font-mono text-xs text-zinc-300" /></label><button type="button" onClick={() => void copyPixCode()} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-[#0B0F14] hover:bg-emerald-400">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copiado' : 'Copiar código Pix'}</button><div className="mt-4 flex items-center justify-center gap-2 text-sm" role="status">{paymentStatus === 'PENDING' && <><LoaderCircle size={15} className="animate-spin text-amber-300" /><span className="text-amber-200">Aguardando pagamento</span></>}{paymentStatus === 'PAID' && <><Check size={16} className="text-emerald-400" /><span className="text-emerald-300">Pagamento confirmado</span></>}{paymentStatus === 'FAILED' && <span className="text-red-300">Pagamento não aprovado. Inicie uma nova tentativa.</span>}</div></div>}
          {deepLinkUrl && <div className="mt-6 pt-6 border-t border-[#1e1e24] text-center"><p className="text-sm font-semibold text-zinc-100 mb-4">Vincule o Telegram para receber o acesso</p><a href={deepLinkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400">Abrir Telegram e confirmar acesso</a><p className="text-xs text-zinc-600 mt-3">Se o botão não abrir, use este link manualmente: <span className="break-all font-mono text-zinc-400">{deepLinkUrl}</span></p></div>}
        </Card>
        <Card className="p-6 lg:col-span-2 lg:sticky lg:top-8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Resumo</p>
          <p className="font-semibold text-zinc-100">{plan.name}</p>
          {plan.description && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{plan.description}</p>}
          <div className="flex items-baseline gap-1 mt-5"><span className="text-3xl font-bold font-mono text-emerald-400">R$ {plan.price.toFixed(2).replace('.', ',')}</span><span className="text-xs text-zinc-600">/{periodLabel}</span></div>
          <div className="border-t border-[#1e1e24] mt-5 pt-5 space-y-2.5 text-xs text-zinc-500"><p>✓ Acesso imediato ao grupo</p><p>✓ Renovação recorrente</p><p>✓ Cancele quando quiser</p></div>
        </Card>
      </div>
    </div>
  </main>
}
