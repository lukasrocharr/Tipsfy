/**
 * Entidade de notificação do tipster.
 * Mantém o modelo compatível com a tela de dashboard sem criar uma nova tabela de eventos.
 */
export type NotificationType = 'payment' | 'subscriber' | 'system' | 'alert'

export class Notification {
  constructor(
    public readonly id: string,
    public readonly tipsterId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly read: boolean = false,
    public readonly createdAt: Date = new Date(),
  ) {}
}
