import { getServerSession } from 'next-auth'
import { PrismaTipsterRepository } from '../../../infrastructure/database/PrismaTipsterRepository'
import { authOptions } from '../../../infrastructure/factories/authOptions'

export async function getAuthenticatedTipsterId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) return session.user.id
  const email = session?.user?.email
  if (!email) return null

  const tipster = await new PrismaTipsterRepository().buscarPorEmail(
    email.trim().toLowerCase(),
  )
  return tipster?.id ?? null
}