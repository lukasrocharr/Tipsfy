import { PageDocument } from "../../../domain/entities/PageDocument"
import type { SocialLink } from "../../../domain/entities/PageBlock"
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
  pageName?: string
  links?: SocialLink[]
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

    const blocks = structuredClone(template.blocks)
    if (input.pageName !== undefined) {
      const hero = blocks.find((block) => block.type === "HERO")
      if (hero) hero.content.title = input.pageName
    }
    if (input.links !== undefined) {
      const socialLinks = blocks.find((block) => block.type === "SOCIAL_LINKS")
      if (socialLinks) socialLinks.content.links = structuredClone(input.links)
    }

    const pageDocument = new PageDocument({
      ...template,
      channelId: input.channelId,
      blocks,
      globalTheme: { ...template.globalTheme },
      updatedAt: new Date(),
    })

    await this.pageDocumentRepository.salvar(pageDocument)
    return pageDocument
  }
}
