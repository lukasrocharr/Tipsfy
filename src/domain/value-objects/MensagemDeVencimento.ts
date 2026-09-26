import type { Subscription } from '../entities/Subscription'

type DadosMensagemVencimento = {
  subscriberName: string
  planName: string
  dueDate: Date
}

export class MensagemDeVencimento {
  public readonly texto: string

  private constructor(input: DadosMensagemVencimento) {
    this.texto = [
      `Olá, ${input.subscriberName}!`,
      `Seu acesso ao canal vence em ${input.dueDate.toLocaleDateString('pt-BR')} .`,
      'Renove para continuar recebendo os alertas e dicas do canal.',
      `Plano: ${input.planName}`,
      'Se quiser manter o acesso, faça a renovação pelo link do seu plano.',
    ].join('\n')
  }

  static criar(input: DadosMensagemVencimento): MensagemDeVencimento {
    return new MensagemDeVencimento(input)
  }
}
