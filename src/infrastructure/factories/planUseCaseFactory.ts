import { AtualizarPlanoUseCase } from '../../application/use-cases/plans/AtualizarPlanoUseCase'
import { CriarPlanoUseCase } from '../../application/use-cases/plans/CriarPlanoUseCase'
import { ListarPlanosUseCase } from '../../application/use-cases/plans/ListarPlanosUseCase'
import { RemoverPlanoUseCase } from '../../application/use-cases/plans/RemoverPlanoUseCase'
import { PrismaPlanRepository } from '../database/PrismaPlanRepository'

export function planUseCasesFactory() {
  const repository = new PrismaPlanRepository()
  return {
    criar: new CriarPlanoUseCase(repository),
    atualizar: new AtualizarPlanoUseCase(repository),
    listar: new ListarPlanosUseCase(repository),
    remover: new RemoverPlanoUseCase(repository),
  }
}
