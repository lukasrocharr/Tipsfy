import { describe, expect, it } from "vitest"
import { AtualizarDocumentoDaPaginaUseCase } from "../../src/application/use-cases/page-builder/AtualizarDocumentoDaPaginaUseCase"
import { CriarPaginaAPartirDeTemplateUseCase } from "../../src/application/use-cases/page-builder/CriarPaginaAPartirDeTemplateUseCase"
import { ListarTemplatesDisponiveisUseCase } from "../../src/application/use-cases/page-builder/ListarTemplatesDisponiveisUseCase"
import { ObterDocumentoDaPaginaParaEdicaoUseCase } from "../../src/application/use-cases/page-builder/ObterDocumentoDaPaginaParaEdicaoUseCase"
import type { ChannelRepository } from "../../src/application/ports/ChannelRepository"
import type { PageDocumentRepository } from "../../src/application/ports/PageDocumentRepository"
import {
  StaticPageTemplateCatalog,
  PAGE_BUILDER_TEMPLATES,
} from "../../src/infrastructure/page-builder/templates"
import type { TipsterRepository } from "../../src/application/ports/TipsterRepository"
import { Channel } from "../../src/domain/entities/Channel"
import type { PageBlock } from "../../src/domain/entities/PageBlock"
import {
  MAX_PAGE_BLOCKS,
  PageDocument,
  type PageDocumentProps,
} from "../../src/domain/entities/PageDocument"
import { Tipster, type PlanTier } from "../../src/domain/entities/Tipster"
import { EstiloInvalidoError } from "../../src/domain/errors/EstiloInvalidoError"
import { PaginaJaConfiguradaError } from "../../src/domain/errors/PaginaJaConfiguradaError"
import { RecursoNaoDisponivelNoPlanoError } from "../../src/domain/errors/RecursoNaoDisponivelNoPlanoError"
import { PAGE_BUILDER_TEMPLATES } from "../../src/infrastructure/page-builder/templates"

class ChannelRepositoryFake implements ChannelRepository {
  constructor(private readonly channel: Channel) {}

  async salvar(): Promise<void> {}
  async buscarPorId(id: string): Promise<Channel | null> {
    return id === this.channel.id ? this.channel : null
  }
  async buscarPorPublicSlug(): Promise<Channel | null> {
    return null
  }
  async listarPorTipsterId(): Promise<Channel[]> {
    return [this.channel]
  }
  async atualizarBotToken(): Promise<void> {}
}

class TipsterRepositoryFake implements TipsterRepository {
  constructor(private readonly tipster: Tipster) {}

  async salvar(): Promise<void> {}
  async buscarPorId(id: string): Promise<Tipster | null> {
    return id === this.tipster.id ? this.tipster : null
  }
  async buscarPorEmail(): Promise<Tipster | null> {
    return null
  }
  async existeEmail(): Promise<boolean> {
    return true
  }
}

class PageDocumentRepositoryFake implements PageDocumentRepository {
  readonly saved: PageDocument[] = []
  private readonly documents = new Map<string, PageDocument>()

  constructor(initialDocument?: PageDocument) {
    if (initialDocument)
      this.documents.set(initialDocument.channelId, initialDocument)
  }

  async obterPorCanal(channelId: string): Promise<PageDocument | null> {
    return this.documents.get(channelId) ?? null
  }

  async salvar(pageDocument: PageDocument): Promise<void> {
    this.saved.push(pageDocument)
    this.documents.set(pageDocument.channelId, pageDocument)
  }
}

function createDocumentProps(): PageDocumentProps {
  return {
    ...structuredClone(PAGE_BUILDER_TEMPLATES["clube-essencial"]),
    channelId: "channel-1",
    updatedAt: new Date("2026-09-26T00:00:00.000Z"),
  }
}

function createContext(
  options: {
    planTier?: PlanTier
    ownerId?: string
    existingDocument?: PageDocument
  } = {},
) {
  const channel = new Channel(
    "channel-1",
    options.ownerId ?? "tipster-1",
    "chat-1",
    null,
    "Canal",
  )
  const tipster = new Tipster(
    "tipster-1",
    "tipster@example.com",
    "hash",
    options.planTier ?? "PRO",
    new Date("2026-01-01T00:00:00.000Z"),
  )
  const pageDocumentRepository = new PageDocumentRepositoryFake(
    options.existingDocument,
  )
  const channelRepository = new ChannelRepositoryFake(channel)
  const tipsterRepository = new TipsterRepositoryFake(tipster)

  return {
    pageDocumentRepository,
    create: new CriarPaginaAPartirDeTemplateUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
      new StaticPageTemplateCatalog(),
    ),
    get: new ObterDocumentoDaPaginaParaEdicaoUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
    ),
    update: new AtualizarDocumentoDaPaginaUseCase(
      pageDocumentRepository,
      channelRepository,
      tipsterRepository,
    ),
  }
}

describe("ListarTemplatesDisponiveisUseCase", () => {
  it("retorna os quatro templates com preview textual e thumbnail, sem exigir plano", () => {
    const templates = new ListarTemplatesDisponiveisUseCase(
      new StaticPageTemplateCatalog(),
    ).execute()

    expect(templates).toHaveLength(4)
    expect(templates[0]).toMatchObject({
      templateId: "clube-essencial",
      nome: "Clube Essencial",
      previewText: expect.stringContaining("Análises claras"),
      thumbnailUrl: "/images/banner-placeholder.jpg",
    })
  })
})

describe("CriarPaginaAPartirDeTemplateUseCase", () => {
  it("cria uma cópia independente do template para o canal", async () => {
    const context = createContext()

    const pageDocument = await context.create.execute({
      tipsterId: "tipster-1",
      channelId: "channel-1",
      templateId: "clube-essencial",
    })

    expect(pageDocument).toBeInstanceOf(PageDocument)
    expect(pageDocument.channelId).toBe("channel-1")
    expect(context.pageDocumentRepository.saved).toEqual([pageDocument])
    expect(pageDocument.blocks).not.toBe(
      PAGE_BUILDER_TEMPLATES["clube-essencial"].blocks,
    )
  })

  it("bloqueia Starter", async () => {
    const context = createContext({ planTier: "STARTER" })

    await expect(
      context.create.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        templateId: "clube-essencial",
      }),
    ).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })

  it("rejeita canal de outro tipster", async () => {
    const context = createContext({ ownerId: "someone-else" })

    await expect(
      context.create.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        templateId: "clube-essencial",
      }),
    ).rejects.toThrow("não pertence ao tipster")
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })

  it("não substitui um documento existente sem confirmação explícita", async () => {
    const existing = new PageDocument(createDocumentProps())
    const context = createContext({ existingDocument: existing })

    await expect(
      context.create.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        templateId: "dia-de-jogo",
      }),
    ).rejects.toBeInstanceOf(PaginaJaConfiguradaError)
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })
})

describe("ObterDocumentoDaPaginaParaEdicaoUseCase", () => {
  it("retorna null quando o canal ainda não tem documento", async () => {
    const context = createContext()

    await expect(
      context.get.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
      }),
    ).resolves.toBeNull()
  })

  it("bloqueia Starter", async () => {
    const context = createContext({ planTier: "STARTER" })

    await expect(
      context.get.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
      }),
    ).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
  })

  it("rejeita canal de outro tipster", async () => {
    const context = createContext({ ownerId: "someone-else" })

    await expect(
      context.get.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
      }),
    ).rejects.toThrow("não pertence ao tipster")
  })
})

describe("AtualizarDocumentoDaPaginaUseCase", () => {
  it("valida o domínio e salva o documento", async () => {
    const context = createContext()
    const props = createDocumentProps()

    await context.update.execute({
      tipsterId: "tipster-1",
      channelId: "channel-1",
      document: props,
    })

    expect(context.pageDocumentRepository.saved).toHaveLength(1)
  })

  it("bloqueia Starter", async () => {
    const context = createContext({ planTier: "STARTER" })

    await expect(
      context.update.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        document: createDocumentProps(),
      }),
    ).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })

  it("rejeita canal de outro tipster", async () => {
    const context = createContext({ ownerId: "someone-else" })

    await expect(
      context.update.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        document: createDocumentProps(),
      }),
    ).rejects.toThrow("não pertence ao tipster")
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })

  it.each(["block-limit", "invalid-color", "invalid-font"] as const)(
    "rejeita %s antes de salvar",
    async (invalidCase) => {
      const context = createContext()
      const document = createDocumentProps()
      let expectedError: new (...args: never[]) => Error = RangeError

      if (invalidCase === "block-limit") {
        const style = document.blocks[0].style
        document.blocks = Array.from(
          { length: MAX_PAGE_BLOCKS + 1 },
          (_, index) => ({
            id: `55000000-0000-4000-8000-${index.toString().padStart(12, "0")}`,
            type: "DIVIDER",
            content: {},
            style,
          }),
        )
      } else if (invalidCase === "invalid-color") {
        document.globalTheme = {
          ...document.globalTheme,
          primaryColorId:
            "unknown-palette" as typeof document.globalTheme.primaryColorId,
        }
        expectedError = EstiloInvalidoError
      } else {
        const block = document.blocks[0]
        document.blocks[0] = {
          ...block,
          style: {
            ...block.style,
            fontFamily: "Unknown Font" as typeof block.style.fontFamily,
          },
        }
        expectedError = EstiloInvalidoError
      }

      await expect(
        context.update.execute({
          tipsterId: "tipster-1",
          channelId: "channel-1",
          document,
        }),
      ).rejects.toBeInstanceOf(expectedError)
      expect(context.pageDocumentRepository.saved).toHaveLength(0)
    },
  )

  it("não aceita salvar um documento identificado com outro canal", async () => {
    const context = createContext()
    const document = createDocumentProps()
    document.channelId = "other-channel"

    await expect(
      context.update.execute({
        tipsterId: "tipster-1",
        channelId: "channel-1",
        document,
      }),
    ).rejects.toThrow("não pertence ao canal informado")
    expect(context.pageDocumentRepository.saved).toHaveLength(0)
  })
})
