/**
 * Registro persistente das decisões críticas do motor de cobrança.
 * Mantém rastreabilidade de cada remoção de acesso ou outra ação automática,
 * especialmente quando o processo depende de regras de tolerância e webhook.
 */
export class AuditLog {
  constructor(
    public readonly subscriptionId: string,
    public readonly action: string,
    public readonly details: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
