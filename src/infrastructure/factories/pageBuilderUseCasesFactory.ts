import type { Prisma } from "@prisma/client"
import { AtualizarDocumentoDaPaginaUseCase } from "../../application/use-cases/page-builder/AtualizarDocumentoDaPaginaUseCase"
import { CriarPaginaAPartirDeTemplateUseCase } from "../../application/use-cases/page-builder/CriarPaginaAPartirDeTemplateUseCase"
import { ListarTemplatesDisponiveisUseCase } from "../../application/use-cases/page-builder/ListarTemplatesDisponiveisUseCase"
import { ObterDocumentoDaPaginaParaEdicaoUseCase } from "../../application/use-cases/page-builder/ObterDocumentoDaPaginaParaEdicaoUseCase"
import { PrismaChannelRepository } from "../database/PrismaChannelRepository"
import { PrismaPageDocumentRepository } from "../database/PrismaPageDocumentRepository"
import { PrismaTipsterRepository } from "../database/PrismaTipsterRepository"
import { prisma } from "../database/prisma"
import { StaticPageTemplateCatalog } from "../page-builder/templates"

export function pageBuilderUseCasesFactory(
  database: Prisma.TransactionClient = prisma,
) {
  const pageDocumentRepository = new PrismaPageDocumentRepository(database)
  const channelRepository = new PrismaChannelRepository(database)
  const tipsterRepository = new PrismaTipsterRepository(database)
  const templateCatalog = new StaticPageTemplateCatalog()

  return {
    listarTemplates: new ListarTemplatesDisponiveisUseCase(templateCatalog),
    criarPagina: new CriarPaginaAPartirDeTemplateUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
      templateCatalog,
    ),
    obterPagina: new ObterDocumentoDaPaginaParaEdicaoUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
    ),
    atualizarPagina: new AtualizarDocumentoDaPaginaUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
    ),
  }
}
