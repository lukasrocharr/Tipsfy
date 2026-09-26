/**
 * Entidade do assinante final, sem conta própria na plataforma.
 * Os nomes telegram, telegramId e email preservam o contrato de data.ts para as telas futuras.
 */
import type { Subscription } from './Subscription'

export class Subscriber {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly telegram: string | null,
    public readonly telegramId: string | null,
    public readonly email: string,
    public readonly channelId: string,
    public readonly subscriptions: Subscription[] = [],
    public readonly pendingLinkToken: string | null = null,
  ) {}
}