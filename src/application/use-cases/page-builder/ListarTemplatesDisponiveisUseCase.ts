import type {
  PageTemplateCatalog,
  PageTemplateId,
} from "../../ports/PageTemplateCatalog"

export type PageTemplateMetadata = {
  templateId: PageTemplateId
  nome: string
  previewText: string
  thumbnailUrl: string | null
}

const TEMPLATE_NAMES: Record<PageTemplateId, string> = {
  "clube-essencial": "Clube Essencial",
  "dia-de-jogo": "Dia de Jogo",
  "resultados-abertos": "Resultados Abertos",
  "cartao-do-tipster": "Cartão do Tipster",
}

export class ListarTemplatesDisponiveisUseCase {
  constructor(private readonly templateCatalog: PageTemplateCatalog) {}

  execute(): PageTemplateMetadata[] {
    return this.templateCatalog.listar().map((template) => ({
      templateId: template.templateId,
      nome: template.name,
      previewText: template.previewText,
      thumbnailUrl: template.thumbnailUrl,
    }))
  }
}
