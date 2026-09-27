import type { PageDocument } from "../../domain/entities/PageDocument"

export type PageTemplateId = "clube-essencial" | "dia-de-jogo" | "resultados-abertos" | "cartao-do-tipster"

export type PageDocumentTemplate = Omit<PageDocument, "channelId">

export type PageTemplateDefinition = {
  templateId: PageTemplateId
  name: string
  previewText: string
  thumbnailUrl: string | null
  document: PageDocumentTemplate
}

export interface PageTemplateCatalog {
  listar(): PageTemplateDefinition[]
  obterPorId(templateId: PageTemplateId): PageTemplateDefinition | null
}
