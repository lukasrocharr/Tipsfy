import { CriarCanalUseCase } from '../../application/use-cases/channels/CriarCanalUseCase'
import { PrismaChannelRepository } from '../database/PrismaChannelRepository'
import { PrismaTipsterRepository } from '../database/PrismaTipsterRepository'

export function criarCanalUseCaseFactory(): CriarCanalUseCase {
  return new CriarCanalUseCase(new PrismaChannelRepository(), new PrismaTipsterRepository())
}