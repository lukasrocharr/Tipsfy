'use client'

export class AuthRequestError extends Error {}

export function useAuth() {
  async function signUp(email: string, senha: string): Promise<void> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null
      throw new AuthRequestError(body?.message ?? 'Não foi possível criar a conta.')
    }
  }

  return { signUp }
}
