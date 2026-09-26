import { NextResponse } from 'next/server'
import { PrismaAuditLogRepository } from '../../../../../infrastructure/database/PrismaAuditLogRepository'
import { PrismaChannelRepository } from '../../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaPlanRepository } from '../../../../../infrastructure/database/PrismaPlanRepository'
import { PrismaSubscriberRepository } from '../../../../../infrastructure/database/PrismaSubscriberRepository'
import { PrismaSubscriptionRepository } from '../../../../../infrastructure/database/PrismaSubscriptionRepository'
import { RemoverAcessoUseCase } from '../../../../../application/use-cases/subscriptions/RemoverAcessoUseCase'
import { CancelarAssinaturaUseCase } from '../../../../../application/use-cases/subscriptions/CancelarAssinaturaUseCase'
import { AesCriptografiaService } from '../../../../../infrastructure/crypto/AesCriptografiaService'
import { TelegramClientGrammy } from '../../../../../infrastructure/telegram/TelegramClientGrammy'
import { getAuthenticatedTipsterId } from '../../../../../interfaces/http/auth/session'

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const { id } = await context.params
  const subscriptionRepository = new PrismaSubscriptionRepository()
  const subscription = await subscriptionRepository.buscarPorId(id)
  if (!subscription) return NextResponse.json({ message: 'Assinatura não encontrada.' }, { status: 404 })

  const plan = await new PrismaPlanRepository().buscarPorId(subscription.planId)
  if (!plan) return NextResponse.json({ message: 'Plano não encontrado.' }, { status: 404 })

  const channel = await new PrismaChannelRepository().buscarPorId(plan.channelId)
  if (!channel || channel.tipsterId !== tipsterId) return NextResponse.json({ message: 'Canal não encontrado.' }, { status: 404 })

  const removerAcessoUseCase = new RemoverAcessoUseCase(
    subscriptionRepository,
    new PrismaSubscriberRepository(),
    new PrismaPlanRepository(),
    new PrismaChannelRepository(),
    new AesCriptografiaService(),
    new TelegramClientGrammy(),
  )

  await new CancelarAssinaturaUseCase(subscriptionRepository, removerAcessoUseCase, new PrismaAuditLogRepository()).execute(id)
  return NextResponse.json({ ok: true })
}
