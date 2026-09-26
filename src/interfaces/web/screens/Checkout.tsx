'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Btn, Card, Input, Select } from '../components/ui'

type CheckoutPlan = { name: string; price: number; period: 'monthly' | 'quarterly' | 'annual'; description?: string }

export default function Checkout({ planSlug }: { planSlug: string }) {
  const [plan, setPlan] = useState<CheckoutPlan | null>(null)
  const [form, setForm] = useState({ name: '', email: '', telegramUserId: '', paymentMethod: 'pix' as 'pix' | 'credit_card' })
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [pixQrCode, setPixQrCode] = useState('')
  const [deepLinkUrl, setDeepLinkUrl] = useState('')

  useEffect(() => {
    void loadPlan()
  }, [planSlug])

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
    setPaying(true)
    const response = await fetch(`/api/checkout/${planSlug}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const body = await response.json().catch(() => null) as { pixQrCode?: string; checkoutUrl?: string; deepLinkUrl?: string; message?: string } | null
    setPaying(false)
    if (!response.ok) {
      setError(body?.message ?? 'Não foi possível iniciar o pagamento.')
      return
    }
    if (body?.deepLinkUrl) setDeepLinkUrl(body.deepLinkUrl)
    if (form.paymentMethod === 'pix' && body?.pixQrCode) {
      setPixQrCode(body.pixQrCode)
      return
    }
    if (body?.checkoutUrl) window.location.assign(body.checkoutUrl)
  }

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(current => ({ ...current, [key]: event.target.value }))
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
            <Select label="Forma de pagamento" value={form.paymentMethod} onChange={update('paymentMethod')}>
              <option value="pix">Pix</option>
              <option value="credit_card">Cartão de crédito</option>
            </Select>
            {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            <Btn className="w-full" disabled={paying}>{paying ? 'Processando...' : 'Continuar para pagamento →'}</Btn>
          </form>
          {pixQrCode && <div className="mt-6 pt-6 border-t border-[#1e1e24] text-center"><p className="text-sm font-semibold text-zinc-100 mb-4">Escaneie o QR Code Pix</p><div className="inline-flex bg-white p-3 rounded-xl"><QRCodeSVG value={pixQrCode} size={180} /></div><p className="text-xs text-zinc-600 mt-3">A confirmação acontece automaticamente após o pagamento.</p></div>}
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
