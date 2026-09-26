import { ConfirmarPagamentoUseCase } from '../../application/use-cases/checkout/ConfirmarPagamentoUseCase'
import { IniciarCheckoutUseCase } from '../../application/use-cases/checkout/IniciarCheckoutUseCase'
import { MercadoPagoGateway } from '../payments/MercadoPagoGateway'
import { PrismaPaymentRepository } from '../database/PrismaPaymentRepository'
import { PrismaPlanRepository } from '../database/PrismaPlanRepository'
import { PrismaSubscriberRepository } from '../database/PrismaSubscriberRepository'
import { PrismaSubscriptionRepository } from '../database/PrismaSubscriptionRepository'
import { PrismaChannelRepository } from '../database/PrismaChannelRepository'
import { AesCriptografiaService } from '../crypto/AesCriptografiaService'
import { TelegramClientGrammy } from '../telegram/TelegramClientGrammy'
import { LiberarAcessoAoCanalUseCase } from '../../application/use-cases/subscriptions/LiberarAcessoAoCanalUseCase'

export function checkoutUseCasesFactory() {
  const planRepository = new PrismaPlanRepository()
  const subscriberRepository = new PrismaSubscriberRepository()
  const subscriptionRepository = new PrismaSubscriptionRepository()
  const paymentRepository = new PrismaPaymentRepository()
  const channelRepository = new PrismaChannelRepository()
  const paymentGateway = new MercadoPagoGateway()
  const liberarAcessoAoCanalUseCase = new LiberarAcessoAoCanalUseCase(
    subscriptionRepository,
    subscriberRepository,
    planRepository,
    channelRepository,
    new AesCriptografiaService(),
    new TelegramClientGrammy(),
  )
  return {
    iniciar: new IniciarCheckoutUseCase(planRepository, subscriberRepository, subscriptionRepository, paymentRepository, paymentGateway),
    confirmar: new ConfirmarPagamentoUseCase(paymentRepository, subscriptionRepository, liberarAcessoAoCanalUseCase),
  }
}
