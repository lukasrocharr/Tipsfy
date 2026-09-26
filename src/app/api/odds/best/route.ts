import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ObterMelhoresOddsUseCase } from '../../../../application/use-cases/odds/ObterMelhoresOddsUseCase'
import { PrismaOddsCacheRepository } from '../../../../infrastructure/database/PrismaOddsCacheRepository'
import { TheOddsApiProvider } from '../../../../infrastructure/odds/TheOddsApiProvider'

const querySchema = z.object({
  sport: z.string().min(1),
  refresh: z.enum(['0', '1']).default('0'),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ sport: searchParams.get('sport'), refresh: searchParams.get('refresh') ?? '0' })

  if (!parsed.success) {
    return NextResponse.json({ message: 'Parâmetro sport inválido.' }, { status: 400 })
  }

  try {
    const useCase = new ObterMelhoresOddsUseCase(new TheOddsApiProvider(), new PrismaOddsCacheRepository())
    const bestOdds = await useCase.execute({ sportKey: parsed.data.sport, forceRefresh: parsed.data.refresh === '1' })
    return NextResponse.json({ bestOdds })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível consultar as odds agora.'
    const status = message.includes('THE_ODDS_API_KEY') ? 503 : 502
    return NextResponse.json({ message }, { status })
  }
}
