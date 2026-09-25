/**
 * Entidade do plano comercial exibido e editado pelo frontend.
 * O preço permanece em reais porque data.ts já expõe e edita esse formato; a conversão
 * para centavos pertence exclusivamente ao adaptador de pagamentos da Etapa 5.
 */
export type PlanPeriod = 'monthly' | 'quarterly' | 'annual'

export class Plan {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly period: PlanPeriod,
    public readonly active: boolean,
    public readonly description: string | undefined,
    public readonly channelId: string,
    public readonly checkoutSlug: string,
    public readonly subscribers = 0,
  ) {}
}