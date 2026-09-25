import { describe, expect, it } from 'vitest'
import { CriarContaTipsterUseCase, DIAS_DE_TRIAL_GRATUITO } from '../../src/application/use-cases/auth/CriarContaTipsterUseCase'
import type { TipsterRepository } from '../../src/application/ports/TipsterRepository'
import type { Tipster } from '../../src/domain/entities/Tipster'
import { EmailJaCadastradoError } from '../../src/domain/errors/EmailJaCadastradoError'

class TipsterRepositoryFake implements TipsterRepository {
  readonly tipsters: Tipster[] = []

  async salvar(tipster: Tipster): Promise<void> {
    this.tipsters.push(tipster)
  }

  async buscarPorId(id: string): Promise<Tipster | null> {
    return this.tipsters.find(tipster => tipster.id === id) ?? null
  }

  async buscarPorEmail(email: string): Promise<Tipster | null> {
    return this.tipsters.find(tipster => tipster.email === email) ?? null
  }

  async existeEmail(email: string): Promise<boolean> {
    return Boolean(await this.buscarPorEmail(email))
  }
}

describe('CriarContaTipsterUseCase', () => {
  it('recusa e-mail duplicado', async () => {
    const repository = new TipsterRepositoryFake()
    const useCase = new CriarContaTipsterUseCase(repository)

    await useCase.execute({ email: 'rafael@tipsfy.io', senha: 'senha-segura' })

    await expect(useCase.execute({ email: 'RAFAEL@tipsfy.io', senha: 'outra-senha' }))
      .rejects.toBeInstanceOf(EmailJaCadastradoError)
  })

  it('calcula o trial e não retorna o hash da senha', async () => {
    const before = Date.now()
    const repository = new TipsterRepositoryFake()
    const result = await new CriarContaTipsterUseCase(repository).execute({
      email: 'novo@tipsfy.io',
      senha: 'senha-segura',
    })
    const after = Date.now()

    expect(result).not.toHaveProperty('passwordHash')
    expect(result.planTier).toBe('STARTER')
    expect(result.trialEndsAt.getTime()).toBeGreaterThanOrEqual(before + DIAS_DE_TRIAL_GRATUITO * 24 * 60 * 60 * 1000)
    expect(result.trialEndsAt.getTime()).toBeLessThanOrEqual(after + DIAS_DE_TRIAL_GRATUITO * 24 * 60 * 60 * 1000)
    expect(repository.tipsters[0].passwordHash).not.toBe('senha-segura')
  })
})