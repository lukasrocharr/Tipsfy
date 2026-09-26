/**
 * Entidade do canal Telegram administrado pelo tipster.
 * O token fica representado como botTokenEnc para que a infraestrutura possa aplicar
 * criptografia sem fazer a entidade depender de algoritmo, Prisma ou framework.
 */
export class Channel {
  constructor(
    public readonly id: string,
    public readonly tipsterId: string,
    public readonly telegramChatId: string,
    public readonly botTokenEnc: string | null,
    public readonly name: string,
    public readonly publicSlug?: string | null,
  ) {}
}