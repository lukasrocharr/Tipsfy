'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Btn, Input } from '../../interfaces/web/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password: senha, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('E-mail ou senha inválidos.')
      return
    }
    router.push('/dashboard')
  }

  return <main className="min-h-screen bg-[#08080a] flex items-center justify-center px-4">
    <div className="w-full max-w-[440px] bg-[#111114] border border-[#1e1e24] rounded-2xl p-8">
      <div className="mb-6"><h1 className="text-xl font-bold text-zinc-100">Entrar no Tipsfy</h1><p className="text-sm text-zinc-500 mt-1">Acesse sua área de gestão.</p></div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="E-mail" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
        <Input label="Senha" type="password" value={senha} onChange={event => setSenha(event.target.value)} required />
        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
        <Btn className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Btn>
      </form>
      <p className="text-xs text-zinc-600 text-center mt-5">Ainda não tem conta? <Link href="/onboarding" className="text-emerald-400 hover:text-emerald-300">Criar conta</Link></p>
    </div>
  </main>
}
