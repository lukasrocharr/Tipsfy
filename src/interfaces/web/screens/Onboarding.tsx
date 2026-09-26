'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Btn, Input } from '../components/ui'
import { AuthRequestError, useAuth } from '../hooks/useAuth'
import { useConnectBot } from '../hooks/useConnectBot'
import { Check, Circle, CircleAlert, CircleCheck, Hexagon, LoaderCircle } from 'lucide-react'

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
      <span className="relative flex items-center justify-center text-white">
        <Hexagon size={18} strokeWidth={1.5} />
        <Circle size={5} fill="currentColor" className="absolute" />
      </span>
    </div>
    <span className="text-xl font-bold text-zinc-100 tracking-tight">Tipsfy</span>
  </div>
)

export default function Onboarding() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { connectBot, error: botError } = useConnectBot()
  const [step, setStep] = useState(0)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', botToken: '', channelId: '' })

  const steps = [
    { num: 1, label: 'Conta' },
    { num: 2, label: 'Telegram' },
    { num: 3, label: 'Plano' },
  ]

  function handleConnect() {
    setConnecting(true)
    // Antes: timeout local simulava a conexão. Agora: useConnectBot chama a Bot API pelo endpoint protegido.
    void connectBot(form.botToken, form.channelId)
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
      .finally(() => setConnecting(false))
  }

  async function handleCreateAccount() {
    setAccountError('')
    setCreatingAccount(true)
    try {
      // Antes: avançava para o passo 2 apenas com setStep(1). Agora: cadastra via API e só avança após resposta 201.
      await signUp(form.email, form.password)
      // O passo 2 precisa de sessão para criar/atualizar o canal; o passo 3 repete o login como confirmação final.
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      setStep(1)
    } catch (error) {
      setAccountError(error instanceof AuthRequestError ? error.message : 'Não foi possível criar a conta.')
    } finally {
      setCreatingAccount(false)
    }
  }

  async function handleFinish() {
    setFinishError('')
    setFinishing(true)
    // Antes: prop onDone() do App.tsx monolítico. Agora: login real via NextAuth e navegação do App Router.
    const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    if (result?.error) {
      setFinishError('Não foi possível iniciar a sessão. Tente novamente.')
      setFinishing(false)
      return
    }
    router.push('/dashboard')
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#08080a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="mb-10"><Logo /></div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  i < step ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === step ? 'bg-transparent border-emerald-500 text-emerald-400' :
                  'bg-transparent border-zinc-800 text-zinc-600'
                }`}>
                  {i < step ? (
                    <Check size={12} className="text-current" />
                  ) : s.num}
                </div>
                <span className={`text-xs font-medium transition-colors ${i === step ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-20 h-px mx-4 mb-6 transition-colors duration-500 ${i < step ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="w-full max-w-[440px] bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
          {/* Step 0: Account */}
          {step === 0 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-zinc-100">Criar sua conta</h2>
                <p className="text-sm text-zinc-500 mt-1">Comece a gerenciar seus assinantes em minutos.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Input label="Nome completo" value={form.name} onChange={f('name')} placeholder="Rafael Tipster" />
                <Input label="E-mail" type="email" value={form.email} onChange={f('email')} placeholder="rafael@email.com" />
                <Input label="Senha" type="password" value={form.password} onChange={f('password')} placeholder="Mínimo 8 caracteres" />
                <div className="pt-2">
                  <Btn className="w-full" onClick={handleCreateAccount} disabled={!form.name || !form.email || form.password.length < 6 || creatingAccount}>
                    {creatingAccount ? 'Criando conta...' : 'Continuar →'}
                  </Btn>
                  {accountError && <p className="text-xs text-red-400" role="alert">{accountError}</p>}
                </div>
                <p className="text-xs text-zinc-600 text-center">
                  Ao criar uma conta você concorda com os <span className="text-emerald-500 cursor-pointer">Termos de Uso</span>.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Telegram */}
          {step === 1 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-zinc-100">Conectar Telegram</h2>
                <p className="text-sm text-zinc-500 mt-1">Vincule o bot ao seu canal para automação total.</p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">?</span>
                  Como obter o token do bot
                </p>
                <ol className="space-y-1.5 pl-1">
                  {[
                    <>Abra o Telegram e busque <span className="font-mono text-emerald-400 text-xs">@BotFather</span></>,
                    <>Envie <span className="font-mono text-zinc-300">/newbot</span> e defina nome e usuário</>,
                    'Cole abaixo o token gerado (formato: 1234567890:AAH...)',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-500">
                      <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-4">
                <Input label="Token do Bot Telegram" value={form.botToken} onChange={e => { f('botToken')(e); setConnected(false) }} placeholder="1234567890:AAHd..." className="font-mono text-xs" />
                <Input label="ID ou link do canal" value={form.channelId} onChange={e => { f('channelId')(e); setConnected(false) }} placeholder="@SinaisFutebolVIP" className="font-mono text-xs" />

                {connected && (
                  <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-current" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">Bot conectado com sucesso!</p>
                      <p className="text-xs text-zinc-500">Canal: <span className="font-mono">{form.channelId || '@SeuCanal'}</span> • 0 membros ativos</p>
                    </div>
                  </div>
                )}
                {botError && <p className="text-xs text-red-400" role="alert">{botError}</p>}

                <div className="flex gap-3 pt-1">
                  <Btn variant="secondary" className="flex-1" onClick={() => setStep(0)}>← Voltar</Btn>
                  {connected
                    ? <Btn className="flex-1" onClick={() => setStep(2)}>Continuar →</Btn>
                    : <Btn className="flex-1" disabled={!form.botToken || !form.channelId || connecting} onClick={handleConnect}>
                        {connecting ? (
                          <><LoaderCircle size={16} className="animate-spin text-current" />Verificando...</>
                        ) : 'Verificar Conexão'}
                      </Btn>
                  }
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-800/40 flex items-center justify-center mx-auto mb-4">
                  <CircleCheck size={24} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-100">Tudo pronto!</h2>
                <p className="text-sm text-zinc-500 mt-1">Sua conta está configurada e o bot está online.</p>
              </div>

              <div className="space-y-2.5 mb-8">
                {[
                  { ok: true, label: 'Conta criada com sucesso' },
                  { ok: true, label: `Bot Telegram vinculado ao ${form.channelId || '@SeuCanal'}` },
                  { ok: false, label: 'Nenhum plano de assinatura criado ainda' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-900/40 rounded-lg px-4 py-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                      {item.ok
                        ? <Check size={12} className="text-emerald-400" />
                        : <CircleAlert size={12} className="text-amber-400" />
                      }
                    </div>
                    <span className={`text-xs ${item.ok ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Btn variant="secondary" className="flex-1" onClick={handleFinish} disabled={finishing}>
                  Ir ao Dashboard
                </Btn>
                <Btn className="flex-1" onClick={handleFinish} disabled={finishing}>
                  {finishing ? 'Entrando...' : 'Criar Plano →'}
                </Btn>
              </div>
              {finishError && <p className="text-xs text-red-400 mt-3" role="alert">{finishError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
