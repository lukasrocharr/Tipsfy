import { NextResponse } from 'next/server'
import { ObterResumoDoDashboardUseCase } from '../../../../application/use-cases/dashboard/ObterResumoDoDashboardUseCase'
import { GerarNotificacoesUseCase } from '../../../../application/use-cases/notifications/GerarNotificacoesUseCase'
import { prisma } from '../../../../infrastructure/database/prisma'
import { getAuthenticatedTipsterId } from '../../../../interfaces/http/auth/session'

export async function GET() {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })

  const channels = await prisma.channel.findMany({ where: { tipsterId }, select: { id: true } })
  const channelIds = channels.map(channel => channel.id)

  const plans = await prisma.plan.findMany({
    where: { channelId: { in: channelIds } },
    select: { id: true },
  })
  const planIds = plans.map(plan => plan.id)

  const subscriptions = await prisma.subscription.findMany({
    where: { planId: { in: planIds } },
    include: { payments: true },
    orderBy: { dueDate: 'asc' },
  })

  const auditLogs = await prisma.auditLog.findMany({
    where: { subscriptionId: { in: subscriptions.map(subscription => subscription.id) } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const paymentEvents = subscriptions.flatMap(subscription =>
    subscription.payments.map(payment => ({
      status: payment.status,
      amount: Number(payment.amount),
      createdAt: payment.createdAt,
      subscriptionId: subscription.id,
    })),
  )

  const notifications = new GerarNotificacoesUseCase().execute({
    tipsterId,
    payments: paymentEvents,
    auditLogs: auditLogs.map(log => ({
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
    })),
    limit: 5,
  })

  const summary = new ObterResumoDoDashboardUseCase().execute({
    subscriptions: subscriptions.map(subscription => ({
      status: subscription.status,
      dueDate: subscription.dueDate,
      payments: subscription.payments.map(payment => ({
        status: payment.status,
        amount: Number(payment.amount),
        createdAt: payment.createdAt,
      })),
    })),
    notifications,
    tips: [],
  })

  return NextResponse.json(summary)
}
