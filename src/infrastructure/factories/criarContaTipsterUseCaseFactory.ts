import { CriarContaTipsterUseCase } from '../../application/use-cases/auth/CriarContaTipsterUseCase'
import { PrismaTipsterRepository } from '../database/PrismaTipsterRepository'

export function criarContaTipsterUseCaseFactory(): CriarContaTipsterUseCase {
  return new CriarContaTipsterUseCase(new PrismaTipsterRepository())
}
