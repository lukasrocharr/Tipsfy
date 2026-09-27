import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { PrismaTipsterRepository } from '../database/PrismaTipsterRepository'

const repository = new PrismaTipsterRepository()
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET must be configured before starting the application.")
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: nextAuthSecret,
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const tipster = await repository.buscarPorEmail(credentials.email.trim().toLowerCase())
        if (!tipster || !(await bcrypt.compare(credentials.password, tipster.passwordHash))) return null
        return { id: tipster.id, email: tipster.email, name: tipster.email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      if (!token.id && token.sub) token.id = token.sub
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const tipsterId = token.id ?? token.sub ?? null
        if (tipsterId) session.user.id = tipsterId
        else if (typeof session.user.email === 'string') {
          const tipster = await repository.buscarPorEmail(
            session.user.email.trim().toLowerCase(),
          )
          if (tipster) session.user.id = tipster.id
        }
      }
      return session
    },
  },
}
