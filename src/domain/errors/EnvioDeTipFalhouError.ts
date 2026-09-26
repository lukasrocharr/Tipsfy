export class EnvioDeTipFalhouError extends Error {
  constructor(channelName?: string) {
    super(channelName ? `Falha no envio do tip para o canal ${channelName}.` : 'Falha no envio do tip para o canal.')
    this.name = 'EnvioDeTipFalhouError'
  }
}
