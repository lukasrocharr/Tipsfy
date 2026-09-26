import { NextResponse } from 'next/server'
import { VerificarInadimplenciaUseCase } from '../../../../application/use-cases/subscriptions/VerificarInadimplenciaUseCase'
import { PrismaAuditLogRepository } from '../../../../infrastructure/database/PrismaAuditLogRepository'
import { PrismaPaymentRepository } from '../../../../infrastructure/database/PrismaPaymentRepository'
import { PrismaSubscriptionRepository } from '../../../../infrastructure/database/PrismaSubscriptionRepository'
import { PrismaChannelRepository } from '../../../../infrastructure/database/PrismaChannelRepository'
import { PrismaPlanRepository } from '../../../../infrastructure/database/PrismaPlanRepository'
import { PrismaSubscriberRepository } from '../../../../infrastructure/database/PrismaSubscriberRepository'
import { AesCriptografiaService } from '../../../../infrastructure/crypto/AesCriptografiaService'
import { TelegramClientGrammy } from '../../../../infrastructure/telegram/TelegramClientGrammy'
import { RemoverAcessoUseCase } from '../../../../application/use-cases/subscriptions/RemoverAcessoUseCase'
import { NotificarVencimentoProximoUseCase } from '../../../../application/use-cases/subscriptions/NotificarVencimentoProximoUseCase'
import { MercadoPagoGateway } from '../../../../infrastructure/payments/MercadoPagoGateway'

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const subscriptionRepository = new PrismaSubscriptionRepository()
  const paymentRepository = new PrismaPaymentRepository()
  const paymentGateway = new MercadoPagoGateway()
  const channelRepository = new PrismaChannelRepository()
  const planRepository = new PrismaPlanRepository()
  const subscriberRepository = new PrismaSubscriberRepository()
  const auditLogRepository = new PrismaAuditLogRepository()
  const removerAcessoUseCase = new RemoverAcessoUseCase(
    subscriptionRepository,
    subscriberRepository,
    planRepository,
    channelRepository,
    new AesCriptografiaService(),
    new TelegramClientGrammy(),
  )
  const useCase = new VerificarInadimplenciaUseCase(
    subscriptionRepository,
    paymentRepository,
    paymentGateway,
    removerAcessoUseCase,
    auditLogRepository,
    3,
  )
  const avisoUseCase = new NotificarVencimentoProximoUseCase(
    subscriptionRepository,
    subscriberRepository,
    planRepository,
    channelRepository,
    new AesCriptografiaService(),
    new TelegramClientGrammy(),
    auditLogRepository,
  )

  await useCase.execute(new Date())
  await avisoUseCase.execute(new Date())
  return NextResponse.json({ ok: true })
}
