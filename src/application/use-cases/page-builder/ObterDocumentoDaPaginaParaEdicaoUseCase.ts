import type { PageDocument } from "../../../domain/entities/PageDocument"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { PageDocumentRepository } from "../../ports/PageDocumentRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"
import { validarAcessoPageBuilder } from "./validarAcessoPageBuilder"

export type ObterDocumentoDaPaginaParaEdicaoInput = {
  tipsterId: string
  channelId: string
}

export class ObterDocumentoDaPaginaParaEdicaoUseCase {
  constructor(
    private readonly pageDocumentRepository: PageDocumentRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly tipsterRepository: TipsterRepository,
  ) {}

  async execute(
    input: ObterDocumentoDaPaginaParaEdicaoInput,
  ): Promise<PageDocument | null> {
    await validarAcessoPageBuilder(
      input.tipsterId,
      input.channelId,
      this.channelRepository,
      this.tipsterRepository,
    )

    return this.pageDocumentRepository.obterPorCanal(input.channelId)
  }
}
