import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { PrismaTipsterRepository } from '../database/PrismaTipsterRepository'

const repository = new PrismaTipsterRepository()

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/onboarding' },
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
}
