import type { Notification } from '../../domain/entities/Notification'

export interface NotificationRepository {
  listarPorTipsterId(tipsterId: string): Promise<Notification[]>
  marcarComoLida(id: string): Promise<void>
}
