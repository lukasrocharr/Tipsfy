import { describe, expect, it } from 'vitest'
import { calcularMrrPorMes } from '../../src/domain/services/CalculoDeMrr'

describe('calcularMrrPorMes', () => {
  it('retorna 0 para meses sem pagamento confirmado', () => {
    const history = calcularMrrPorMes([
      {
        id: 'sub-1',
        status: 'ACTIVE',
        dueDate: new Date('2026-08-10T00:00:00.000Z'),
        payments: [{ status: 'PAID', amount: 79, createdAt: new Date('2026-08-15T00:00:00.000Z') }],
      },
      {
        id: 'sub-2',
        status: 'ACTIVE',
        dueDate: new Date('2026-09-10T00:00:00.000Z'),
        payments: [{ status: 'FAILED', amount: 79, createdAt: new Date('2026-09-10T00:00:00.000Z') }],
      },
    ])

    expect(history.find(item => item.month === 'ago/2026')?.mrr ?? 0).toBe(79)
    expect(history.find(item => item.month === 'set/2026')?.mrr ?? 0).toBe(0)
  })

  it('soma múltiplos pagamentos confirmados no mesmo mês', () => {
    const history = calcularMrrPorMes([
      {
        id: 'sub-1',
        status: 'ACTIVE',
        dueDate: new Date('2026-09-02T00:00:00.000Z'),
        payments: [
          { status: 'PAID', amount: 39.9, createdAt: new Date('2026-09-03T00:00:00.000Z') },
          { status: 'PAID', amount: 39.9, createdAt: new Date('2026-09-15T00:00:00.000Z') },
        ],
      },
      {
        id: 'sub-2',
        status: 'ACTIVE',
        dueDate: new Date('2026-09-18T00:00:00.000Z'),
        payments: [{ status: 'PAID', amount: 99.9, createdAt: new Date('2026-09-18T00:00:00.000Z') }],
      },
    ])

    expect(history.find(item => item.month === 'set/2026')?.mrr).toBe(179.7)
  })
})
