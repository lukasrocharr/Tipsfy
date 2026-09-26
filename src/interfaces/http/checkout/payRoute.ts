import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkoutUseCasesFactory } from '../../../infrastructure/factories/checkoutUseCaseFactory'

const paySchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  telegramUserId: z.string().trim().optional(),
  paymentMethod: z.enum(['pix', 'credit_card']),
})

export async function POST(request: Request, context: { params: Promise<{ planSlug: string }> }) {
  const { planSlug } = await context.params
  const parsed = paySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Confira os dados informados.' }, { status: 400 })
  try {
    const result = await checkoutUseCasesFactory().iniciar.execute({ planSlug, ...parsed.data })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.'
    const status = message === 'Plano não encontrado.' ? 404 : 502
    return NextResponse.json({ message }, { status })
  }
}
