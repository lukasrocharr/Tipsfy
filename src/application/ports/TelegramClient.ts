/**
 * Porta para as operações mínimas do Telegram usadas pelo negócio.
 * O domínio e os casos de uso não conhecem grammy nem o formato HTTP da Bot API.
 */
export interface TelegramClient {
  validarAcessoDoBot(token: string, chatId: string): Promise<void>
  registrarWebhook(token: string, url: string): Promise<void>
  criarConviteDeUsoUnico(token: string, chatId: string): Promise<string>
  removerMembro(token: string, chatId: string, userId: string): Promise<void>
  enviarMensagemAoCanal(token: string, chatId: string, texto: string): Promise<void>
  enviarMensagemPrivada(token: string, chatId: string, texto: string): Promise<void>
}
