import NextAuth from 'next-auth'
import { authOptions } from '../../../../../infrastructure/factories/authOptions'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
