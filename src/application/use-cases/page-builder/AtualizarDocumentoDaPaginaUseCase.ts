import {
  PageDocument,
  type PageDocumentProps,
} from "../../../domain/entities/PageDocument"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { PageDocumentRepository } from "../../ports/PageDocumentRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"
import { validarAcessoPageBuilder } from "./validarAcessoPageBuilder"

export type AtualizarDocumentoDaPaginaInput = {
  tipsterId: string
  channelId: string
  document: PageDocumentProps
}

export class AtualizarDocumentoDaPaginaUseCase {
  constructor(
    private readonly pageDocumentRepository: PageDocumentRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly tipsterRepository: TipsterRepository,
  ) {}

  async execute(input: AtualizarDocumentoDaPaginaInput): Promise<PageDocument> {
    await validarAcessoPageBuilder(
      input.tipsterId,
      input.channelId,
      this.channelRepository,
      this.tipsterRepository,
    )

    if (input.document.channelId !== input.channelId) {
      throw new Error("O documento não pertence ao canal informado.")
    }

    const pageDocument = new PageDocument({
      ...input.document,
      blocks: structuredClone(input.document.blocks),
      globalTheme: { ...input.document.globalTheme },
      updatedAt: new Date(),
    })

    await this.pageDocumentRepository.salvar(pageDocument)
    return pageDocument
  }
}
