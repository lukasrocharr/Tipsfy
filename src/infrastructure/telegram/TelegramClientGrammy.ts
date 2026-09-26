import { Bot } from 'grammy'
import { BotSemPermissaoDeAdminError } from '../../domain/errors/BotSemPermissaoDeAdminError'
import { TokenInvalidoError } from '../../domain/errors/TokenInvalidoError'
import type { TelegramClient } from '../../application/ports/TelegramClient'

export class TelegramClientGrammy implements TelegramClient {
  async validarAcessoDoBot(token: string, chatId: string): Promise<void> {
    try {
      const bot = new Bot(token)
      // getChat confirma que o token consegue alcançar o canal informado.
      const chat = await bot.api.getChat(chatId)
      // getMe identifica o próprio bot para consultar seu papel no canal.
      const me = await bot.api.getMe()
      // getChatMember diferencia um bot administrador de um membro comum.
      const member = await bot.api.getChatMember(chat.id, me.id)
      if (member.status !== 'administrator' && member.status !== 'creator') throw new BotSemPermissaoDeAdminError()
    } catch (error) {
      if (error instanceof BotSemPermissaoDeAdminError) throw error
      throw new TokenInvalidoError()
    }
  }

  async registrarWebhook(token: string, url: string): Promise<void> {
    const bot = new Bot(token)
    await bot.api.setWebhook(url)
  }

  async criarConviteDeUsoUnico(token: string, chatId: string): Promise<string> {
    const bot = new Bot(token)
    // createChatInviteLink limita o convite a uma única utilização, evitando compartilhamento acidental.
    const invite = await bot.api.createChatInviteLink(chatId, { member_limit: 1 })
    return invite.invite_link
  }

  async removerMembro(token: string, chatId: string, userId: string): Promise<void> {
    const bot = new Bot(token)
    // banChatMember remove o usuário e impede seu retorno imediato ao canal.
    await bot.api.banChatMember(chatId, Number(userId))
    // unbanChatMember libera um eventual retorno futuro por novo convite, sem restaurar acesso atual.
    await bot.api.unbanChatMember(chatId, Number(userId), { only_if_banned: true })
  }

  async enviarMensagemAoCanal(token: string, chatId: string, texto: string): Promise<void> {
    const bot = new Bot(token)
    await bot.api.sendMessage(chatId, texto)
  }

  async enviarMensagemPrivada(token: string, chatId: string, texto: string): Promise<void> {
    const bot = new Bot(token)
    await bot.api.sendMessage(chatId, texto)
  }
}
