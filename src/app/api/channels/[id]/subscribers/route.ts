import { NextResponse } from 'next/server'
import { ListarAssinantesDoCanalUseCase } from '../../../../../application/use-cases/subscriptions/ListarAssinantesDoCanalUseCase'
import { PrismaChannelRepository } from '../../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaPlanRepository } from '../../../../../infrastructure/database/PrismaPlanRepository'
import { PrismaSubscriberRepository } from '../../../../../infrastructure/database/PrismaSubscriberRepository'
import { PrismaSubscriptionRepository } from '../../../../../infrastructure/database/PrismaSubscriptionRepository'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })

  const searchParams = new URL(request.url).searchParams
  const result = await new ListarAssinantesDoCanalUseCase(
    new PrismaSubscriberRepository(),
    new PrismaSubscriptionRepository(),
    new PrismaPlanRepository(),
  ).execute({
    channelId: id,
    page: Number(searchParams.get('page') ?? 1),
    pageSize: Number(searchParams.get('pageSize') ?? 50),
    search: searchParams.get('search') ?? '',
    statusFilter: (searchParams.get('statusFilter') as 'all' | 'active' | 'delinquent' | 'cancelled' | 'trial') ?? 'all',
  })

  return NextResponse.json({ subscribers: result.subscribers, total: result.total, page: result.page, pageSize: result.pageSize })
}
