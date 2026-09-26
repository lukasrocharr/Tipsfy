import { describe, expect, it } from 'vitest'
import { Tipster } from '../../src/domain/entities/Tipster'
import { AtualizarPerfilUseCase } from '../../src/application/use-cases/tipster/AtualizarPerfilUseCase'
import { AtualizarPreferenciasDeNotificacaoUseCase } from '../../src/application/use-cases/tipster/AtualizarPreferenciasDeNotificacaoUseCase'
import { AtualizarDadosBancariosUseCase } from '../../src/application/use-cases/tipster/AtualizarDadosBancariosUseCase'
import { ExcluirContaUseCase } from '../../src/application/use-cases/tipster/ExcluirContaUseCase'
import type { TipsterRepository } from '../../src/application/ports/TipsterRepository'

class TipsterRepositoryFake implements TipsterRepository {
  tipsters: Tipster[] = []

  constructor(initial: Tipster[] = []) {
    this.tipsters = initial
  }

  async salvar(tipster: Tipster): Promise<void> {
    this.tipsters.push(tipster)
  }

  async buscarPorId(id: string): Promise<Tipster | null> {
    return this.tipsters.find(t => t.id === id) ?? null
  }

  async buscarPorEmail(email: string): Promise<Tipster | null> {
    return this.tipsters.find(t => t.email === email) ?? null
  }

  async existeEmail(email: string): Promise<boolean> {
    return Boolean(await this.buscarPorEmail(email))
  }

  async atualizar(tipster: Tipster): Promise<void> {
    const index = this.tipsters.findIndex(item => item.id === tipster.id)
    if (index >= 0) {
      this.tipsters[index] = tipster
    }
  }
}

describe('Tipster settings use cases', () => {
  it('atualiza perfil do tipster', async () => {
    const tipster = new Tipster('t1', 'rafael@tipsfy.io', 'hash', 'PRO', new Date())
    const repository = new TipsterRepositoryFake([tipster])

    const result = await new AtualizarPerfilUseCase(repository).execute({
      tipsterId: 't1',
      name: 'Rafael Tipster',
      email: 'novo@tipsfy.io',
      bio: 'Novo bio',
      website: 'https://rafael.dev',
    })

    expect(result.name).toBe('Rafael Tipster')
    expect(result.email).toBe('novo@tipsfy.io')
    expect(result.bio).toBe('Novo bio')
    expect(result.website).toBe('https://rafael.dev')
  })

  it('atualiza preferências de notificação como JSON simples no tipster', async () => {
    const tipster = new Tipster('t1', 'rafael@tipsfy.io', 'hash', 'PRO', new Date())
    const repository = new TipsterRepositoryFake([tipster])

    const result = await new AtualizarPreferenciasDeNotificacaoUseCase(repository).execute({
      tipsterId: 't1',
      preferences: {
        newSubscriber: true,
        payment: false,
        delinquent: true,
        tips: true,
        weekly: false,
      },
    })

    expect(result.notificationPreferences).toEqual({
      newSubscriber: true,
      payment: false,
      delinquent: true,
      tips: true,
      weekly: false,
    })
  })

  it('atualiza dados bancários do tipster', async () => {
    const tipster = new Tipster('t1', 'rafael@tipsfy.io', 'hash', 'PRO', new Date())
    const repository = new TipsterRepositoryFake([tipster])

    const result = await new AtualizarDadosBancariosUseCase(repository).execute({
      tipsterId: 't1',
      bankDetails: {
        pixType: 'CPF',
        pixKey: '12345678909',
        bank: 'Nubank',
        agency: '0001',
        account: '1234567',
        accountType: 'Corrente',
        ownerDocument: '123.456.789-09',
      },
    })

    expect(result.bankDetails?.pixKey).toBe('12345678909')
    expect(result.bankDetails?.bank).toBe('Nubank')
  })

  it('faz soft delete da conta em vez de remover fisicamente', async () => {
    const tipster = new Tipster('t1', 'rafael@tipsfy.io', 'hash', 'PRO', new Date())
    const repository = new TipsterRepositoryFake([tipster])

    const result = await new ExcluirContaUseCase(repository).execute({ tipsterId: 't1', reason: 'Solicitado pelo usuário' })

    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.email).toBe('rafael@tipsfy.io')
  })
})
