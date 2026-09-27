import { PageDocument } from "../../../domain/entities/PageDocument"
import { PaginaJaConfiguradaError } from "../../../domain/errors/PaginaJaConfiguradaError"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type {
  PageTemplateCatalog,
  PageTemplateId,
} from "../../ports/PageTemplateCatalog"
import type { PageDocumentRepository } from "../../ports/PageDocumentRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"
import { validarAcessoPageBuilder } from "./validarAcessoPageBuilder"

export type CriarPaginaAPartirDeTemplateInput = {
  tipsterId: string
  channelId: string
  templateId: PageTemplateId
}

export class CriarPaginaAPartirDeTemplateUseCase {
  constructor(
    private readonly pageDocumentRepository: PageDocumentRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly tipsterRepository: TipsterRepository,
    private readonly templateCatalog: PageTemplateCatalog,
  ) {}

  async execute(
    input: CriarPaginaAPartirDeTemplateInput,
  ): Promise<PageDocument> {
    await validarAcessoPageBuilder(
      input.tipsterId,
      input.channelId,
      this.channelRepository,
      this.tipsterRepository,
    )

    const templateDefinition = this.templateCatalog.obterPorId(input.templateId)
    if (!templateDefinition)
      throw new Error("Template de página não encontrado.")
    const template = templateDefinition.document

    const existingDocument = await this.pageDocumentRepository.obterPorCanal(
      input.channelId,
    )
    if (existingDocument) {
      // Never replace a customized document implicitly; the frontend must obtain explicit confirmation first.
      throw new PaginaJaConfiguradaError()
    }

    const pageDocument = new PageDocument({
      ...template,
      channelId: input.channelId,
      blocks: structuredClone(template.blocks),
      globalTheme: { ...template.globalTheme },
      updatedAt: new Date(),
    })

    await this.pageDocumentRepository.salvar(pageDocument)
    return pageDocument
  }
}
