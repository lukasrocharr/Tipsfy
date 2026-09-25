import { NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailJaCadastradoError } from '../../../domain/errors/EmailJaCadastradoError'
import { criarContaTipsterUseCaseFactory } from '../../../infrastructure/factories/criarContaTipsterUseCaseFactory'

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(6),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 400 })
  }

  try {
    const tipster = await criarContaTipsterUseCaseFactory().execute(parsed.data)
    return NextResponse.json({ tipster }, { status: 201 })
  } catch (error) {
    if (error instanceof EmailJaCadastradoError) {
      return NextResponse.json({ message: error.message }, { status: 409 })
    }
    return NextResponse.json({ message: 'Não foi possível criar a conta.' }, { status: 500 })
  }
}
