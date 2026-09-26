import type { AuditLogRepository } from '../../ports/AuditLogRepository'
import type { CriptografiaService } from '../../ports/CriptografiaService'
import type { TelegramClient } from '../../ports/TelegramClient'
import { AuditLog } from '../../../domain/entities/AuditLog'
import type { Tip } from '../../../domain/entities/Tip'
import { MensagemDeTip } from '../../../domain/value-objects/MensagemDeTip'

export type EnviarTipAoCanalInput = {
  tip: Tip
  channelId: string
  telegramChatId: string
  botTokenEnc: string | null
  channelName?: string
}

export class EnviarTipAoCanalUseCase {
  constructor(
    private readonly telegramClient: TelegramClient,
    private readonly criptografiaService: CriptografiaService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(input: EnviarTipAoCanalInput): Promise<boolean> {
    if (!input.botTokenEnc) return false

    try {
      const token = this.criptografiaService.descriptografar(input.botTokenEnc)
      const texto = MensagemDeTip.criar(input.tip).texto
      await this.telegramClient.enviarMensagemAoCanal(token, input.telegramChatId, texto)
      return true
    } catch (error) {
      // Falha de ENVIO não deve apagar o registro do tip, pois o valor estatístico já foi salvo.
      // A mensagem pode falhar por problema externo de canal, token ou bot sem afetar a integridade do painel.
      const details = error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem do tip.'
      await this.auditLogRepository.salvar(new AuditLog(
        input.channelId,
        'tip.broadcast.failed',
        `Falha ao enviar tip ${input.tip.id} para o canal ${input.channelName ?? input.channelId}: ${details}`,
      ))
      return false
    }
  }
}
