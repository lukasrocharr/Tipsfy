/**
 * Value Object da recorrência dos planos.
 * O cálculo parte de uma cópia da data para não mutar datas recebidas por outros fluxos.
 */
import type { PlanPeriod } from '../entities/Plan'

export class Periodicity {
  constructor(public readonly period: PlanPeriod) {}

  proximaDataDeVencimento(dataBase: Date): Date {
    const nextDate = new Date(dataBase)
    const monthsToAdd = { monthly: 1, quarterly: 3, annual: 12 }[this.period]
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
    return nextDate
  }
}