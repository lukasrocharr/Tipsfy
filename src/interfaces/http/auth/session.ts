import { getServerSession } from 'next-auth'
import { authOptions } from '../../../infrastructure/factories/authOptions'

export async function getAuthenticatedTipsterId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}