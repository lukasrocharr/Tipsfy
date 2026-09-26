import { randomUUID } from 'node:crypto'
import { Tip } from '../../../domain/entities/Tip'
import { RecursoNaoDisponivelNoPlanoError } from '../../../domain/errors/RecursoNaoDisponivelNoPlanoError'
import type { ChannelRepository } from '../../ports/ChannelRepository'
import type { TipRepository } from '../../ports/TipRepository'
import type { TipsterRepository } from '../../ports/TipsterRepository'
import { EnviarTipAoCanalUseCase } from './EnviarTipAoCanalUseCase'

export type RegistrarTipInput = {
  channelId: string
  sport: string
  event: string
  market?: string
  odds: number
  units: number
  result?: 'green' | 'red' | 'void' | 'pending'
  date?: string
  potentialReturn?: number | null
  bookmaker?: string | null
  notes?: string | null
  id?: string
  broadcastToChannelIds?: string[]
  tipsterId?: string
}

export type RegistrarTipBroadcastResult = {
  channelId: string
  channelName?: string
  status: 'sent' | 'failed' | 'skipped'
  reason?: string
}

export type RegistrarTipResult = Tip & { broadcastResults?: RegistrarTipBroadcastResult[] }

export class RegistrarTipUseCase {
  constructor(
    private readonly repository: TipRepository,
    private readonly channelRepository?: ChannelRepository,
    private readonly tipsterRepository?: TipsterRepository,
    private readonly broadcaster?: EnviarTipAoCanalUseCase,
  ) {}

  async execute(input: RegistrarTipInput): Promise<RegistrarTipResult> {
    const tip = new Tip(
      input.id ?? randomUUID(),
      input.channelId,
      input.sport.trim(),
      input.event.trim(),
      input.market?.trim() || 'Resultado',
      Number(input.odds),
      Number(input.units),
      input.result ?? 'pending',
      input.date ?? new Date().toISOString().slice(0, 10),
      input.potentialReturn ?? null,
      input.bookmaker?.trim() || null,
      input.notes?.trim() || null,
    )

    if (!tip.sport || !tip.event || !Number.isFinite(tip.odds) || !Number.isFinite(tip.units)) {
      throw new Error('Dados da tip inválidos.')
    }

    const existing = await this.repository.buscarPorId(tip.id)
    if (existing) {
      await this.repository.atualizar(tip)
    } else {
      await this.repository.salvar(tip)
    }

    const broadcastResults: RegistrarTipBroadcastResult[] = []
    if (input.broadcastToChannelIds && input.broadcastToChannelIds.length > 0) {
      const ownerChannel = this.channelRepository ? await this.channelRepository.buscarPorId(input.channelId) : null
      const tipsterId = input.tipsterId ?? ownerChannel?.tipsterId
      if (!tipsterId || !this.tipsterRepository || !this.channelRepository) {
        throw new Error('Configuração de broadcast de tip incompleta.')
      }

      const tipster = await this.tipsterRepository.buscarPorId(tipsterId)
      if (!tipster) throw new Error('Tipster não encontrado.')
      if (tipster.planTier === 'STARTER') {
        throw new RecursoNaoDisponivelNoPlanoError('STARTER')
      }

      if (!this.broadcaster) {
        throw new Error('Configuração de broadcast de tip incompleta.')
      }

      const channelIds = [...new Set(input.broadcastToChannelIds.filter(id => id && id !== input.channelId))]
      for (const targetChannelId of channelIds) {
        const targetChannel = await this.channelRepository.buscarPorId(targetChannelId)
        if (!targetChannel || targetChannel.tipsterId !== tipsterId) {
          broadcastResults.push({ channelId: targetChannelId, status: 'skipped', reason: 'Canal não pertence ao tipster.' })
          continue
        }

        const sent = await this.broadcaster.execute({
          tip,
          channelId: targetChannel.id,
          telegramChatId: targetChannel.telegramChatId,
          botTokenEnc: targetChannel.botTokenEnc,
          channelName: targetChannel.name,
        })

        broadcastResults.push({
          channelId: targetChannel.id,
          channelName: targetChannel.name,
          status: sent ? 'sent' : 'failed',
          reason: sent ? undefined : 'Falha ao enviar a mensagem para o canal.',
        })
      }
    }

    return Object.assign(tip, { broadcastResults })
  }
}
