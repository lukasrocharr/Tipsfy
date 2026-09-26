import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AtualizarPerfilUseCase } from '../../../application/use-cases/tipster/AtualizarPerfilUseCase'
import { PrismaTipsterRepository } from '../../../infrastructure/database/PrismaTipsterRepository'
import { getAuthenticatedTipsterId } from '../auth/session'

const profileSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional(),
  bio: z.string().trim().max(280).optional(),
  website: z.string().trim().max(200).optional(),
})

export async function PATCH(request: Request) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Dados do perfil inválidos.' }, { status: 400 })

  const result = await new AtualizarPerfilUseCase(new PrismaTipsterRepository()).execute({ tipsterId, ...parsed.data })
  return NextResponse.json({ tipster: result })
}
