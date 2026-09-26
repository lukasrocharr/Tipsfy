import { describe, expect, it } from 'vitest'
import type { AuditLogRepository } from '../../src/application/ports/AuditLogRepository'
import type { CriptografiaService } from '../../src/application/ports/CriptografiaService'
import type { TelegramClient } from '../../src/application/ports/TelegramClient'
import { Tip } from '../../src/domain/entities/Tip'
import { AuditLog } from '../../src/domain/entities/AuditLog'
import { EnviarTipAoCanalUseCase } from '../../src/application/use-cases/tips/EnviarTipAoCanalUseCase'

class TelegramClientFake implements TelegramClient {
  async validarAcessoDoBot(): Promise<void> {}
  async registrarWebhook(): Promise<void> {}
  async criarConviteDeUsoUnico(): Promise<string> { return '' }
  async removerMembro(): Promise<void> {}
  async enviarMensagemAoCanal(): Promise<void> { throw new Error('telegram down') }
}

class CriptografiaFake implements CriptografiaService {
  criptografar(value: string): string { return `enc:${value}` }
  descriptografar(value: string): string { return value.replace('enc:', '') }
}

class AuditLogRepositoryFake implements AuditLogRepository {
  logs: AuditLog[] = []
  async salvar(log: AuditLog): Promise<void> { this.logs.push(log) }
}

describe('EnviarTipAoCanalUseCase', () => {
  it('não bloqueia o registro quando o envio falha e grava auditoria', async () => {
    const telegramClient = new TelegramClientFake()
    const auditLogRepository = new AuditLogRepositoryFake()
    const useCase = new EnviarTipAoCanalUseCase(telegramClient, new CriptografiaFake(), auditLogRepository)

    const tip = new Tip(
      'tip-1',
      'channel-1',
      'Futebol',
      'Flamengo x Palmeiras',
      'Ambas Marcam',
      2.5,
      1.5,
      'pending',
      '2026-09-25',
      null,
      'Bet365',
      'teste',
    )

    const result = await useCase.execute({
      tip,
      channelId: 'channel-2',
      telegramChatId: '@canal2',
      botTokenEnc: 'enc:123456789:abc',
    })

    expect(result).toBe(false)
    expect(auditLogRepository.logs).toHaveLength(1)
    expect(auditLogRepository.logs[0].action).toBe('tip.broadcast.failed')
  })
})
