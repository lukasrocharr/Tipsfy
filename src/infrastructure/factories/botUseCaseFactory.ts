import { ConectarBotUseCase } from '../../application/use-cases/channels/ConectarBotUseCase'
import { DesconectarBotUseCase } from '../../application/use-cases/channels/DesconectarBotUseCase'
import { AesCriptografiaService } from '../crypto/AesCriptografiaService'
import { PrismaChannelRepository } from '../database/PrismaChannelRepository'
import { TelegramClientGrammy } from '../telegram/TelegramClientGrammy'

export function botUseCasesFactory() {
  const channelRepository = new PrismaChannelRepository()
  return {
    conectar: new ConectarBotUseCase(channelRepository, new TelegramClientGrammy(), new AesCriptografiaService()),
    desconectar: new DesconectarBotUseCase(channelRepository),
  }
}
