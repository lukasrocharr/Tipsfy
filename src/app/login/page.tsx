'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    let destination = '/dashboard'
    const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
    if (callbackUrl) {
      try {
        const callback = new URL(callbackUrl, window.location.origin)
        if (callback.origin === window.location.origin) {
          destination = `${callback.pathname}${callback.search}${callback.hash}`
        }
      } catch {
        destination = '/dashboard'
      }
    }

    try {
      const result = await signIn('credentials', {
        email,
        password: senha,
        callbackUrl: destination,
        redirect: false,
      })
      if (result?.error) {
        setError('E-mail ou senha inválidos.')
        return
      }
      router.push(destination)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1>Login Tipsfy</h1>
          <div className="input-box">
            <input
              placeholder="Usuário"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={event => setSenha(event.target.value)}
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Lembrar senha
            </label>
            <a href="#">Esqueci a senha</a>
          </div>

          {error && <p role="alert">{error}</p>}
          <button type="submit" className="login" disabled={loading}>
            {loading ? 'Entrando...' : 'Login'}
          </button>

          <div className="register-link">
            <p>Não tem uma conta? <a href="/onboarding">Cadastre-se</a></p>
          </div>
        </form>
      </div>
    </main>
  )
}
