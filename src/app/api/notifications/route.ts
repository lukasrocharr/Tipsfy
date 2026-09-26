import { NextResponse } from 'next/server'
import { PrismaNotificationRepository } from '../../../infrastructure/database/PrismaNotificationRepository'
import { getAuthenticatedTipsterId } from '../../../interfaces/http/auth/session'

export async function GET() {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const notifications = await new PrismaNotificationRepository().listarPorTipsterId(tipsterId)
  return NextResponse.json({ notifications: notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    time: notification.createdAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
  })) })
}
