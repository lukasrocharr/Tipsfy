import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET as getTemplates } from "../../../src/interfaces/http/page-builder/templates/route"
import {
  GET as getPageDocument,
  PATCH as patchPageDocument,
} from "../../../src/interfaces/http/channels/pageDocument/route"
import { POST as createFromTemplate } from "../../../src/interfaces/http/channels/pageDocument/from-template/route"
import { PaginaJaConfiguradaError } from "../../../src/domain/errors/PaginaJaConfiguradaError"
import { RecursoNaoDisponivelNoPlanoError } from "../../../src/domain/errors/RecursoNaoDisponivelNoPlanoError"

const mocks = vi.hoisted(() => ({
  tipsterId: null as string | null,
  channel: null as { tipsterId: string } | null,
  findChannel: vi.fn(),
  findTipster: vi.fn(),
  listTemplates: vi.fn(),
  createPage: vi.fn(),
  getPage: vi.fn(),
  updatePage: vi.fn(),
}))

vi.mock("../../../src/interfaces/http/auth/session", () => ({
  getAuthenticatedTipsterId: async () => mocks.tipsterId,
}))

vi.mock("../../../src/infrastructure/database/PrismaChannelRepository", () => ({
  PrismaChannelRepository: class {
    async buscarPorId(id: string) {
      return mocks.findChannel(id)
    }
  },
}))

vi.mock("../../../src/infrastructure/database/PrismaTipsterRepository", () => ({
  PrismaTipsterRepository: class {
    async buscarPorId(id: string) {
      return mocks.findTipster(id)
    }
  },
}))

vi.mock(
  "../../../src/infrastructure/factories/pageBuilderUseCasesFactory",
  () => ({
    pageBuilderUseCasesFactory: () => ({
      listarTemplates: { execute: mocks.listTemplates },
      criarPagina: { execute: mocks.createPage },
      obterPagina: { execute: mocks.getPage },
      atualizarPagina: { execute: mocks.updatePage },
    }),
  }),
)

const routeContext = { params: Promise.resolve({ id: "channel-1" }) }

function jsonRequest(method: string, body: unknown): Request {
  return new Request("http://localhost/api/channels/channel-1/page-document", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const unauthenticatedRequests = [
  ["templates", () => getTemplates()],
  [
    "document GET",
    () => getPageDocument(new Request("http://localhost"), routeContext),
  ],
  [
    "from-template POST",
    () =>
      createFromTemplate(
        jsonRequest("POST", { templateId: "clube-essencial" }),
        routeContext,
      ),
  ],
  [
    "document PATCH",
    () => patchPageDocument(jsonRequest("PATCH", {}), routeContext),
  ],
] as const

const foreignChannelRequests = [
  [
    "document GET",
    () => getPageDocument(new Request("http://localhost"), routeContext),
  ],
  [
    "from-template POST",
    () =>
      createFromTemplate(
        jsonRequest("POST", { templateId: "clube-essencial" }),
        routeContext,
      ),
  ],
  [
    "document PATCH",
    () => patchPageDocument(jsonRequest("PATCH", {}), routeContext),
  ],
] as const

describe("rotas do Page Builder", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.tipsterId = "tipster-1"
    mocks.channel = { tipsterId: "tipster-1" }
    mocks.findChannel.mockImplementation(async () => mocks.channel)
    mocks.findTipster.mockImplementation(async (id: string) =>
      id === "tipster-1"
        ? { email: "tipster-1@example.test", planTier: "PRO" }
        : null,
    )
    mocks.listTemplates.mockReturnValue([{ templateId: "clube-essencial" }])
    mocks.createPage.mockResolvedValue({ channelId: "channel-1" })
    mocks.getPage.mockResolvedValue({ channelId: "channel-1" })
    mocks.updatePage.mockResolvedValue({ channelId: "channel-1" })
  })

  it.each(unauthenticatedRequests)(
    "%s retorna 401 sem sessão",
    async (_name, makeRequest) => {
      mocks.tipsterId = null

      const response = await makeRequest()

      expect(response.status).toBe(401)
    },
  )

  it("lista os templates para uma sessão autenticada", async () => {
    const response = await getTemplates()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      templates: [{ templateId: "clube-essencial" }],
    })
    expect(mocks.listTemplates).toHaveBeenCalledOnce()
  })

  it.each(foreignChannelRequests)(
    "%s retorna 404 para canal de outro tipster antes do Use Case",
    async (_name, makeRequest) => {
      mocks.channel = { tipsterId: "another-tipster" }

      const response = await makeRequest()

      expect(response.status).toBe(404)
      expect(mocks.createPage).not.toHaveBeenCalled()
      expect(mocks.getPage).not.toHaveBeenCalled()
      expect(mocks.updatePage).not.toHaveBeenCalled()
    },
  )

  it("não autoriza um canal inexistente pelo antigo e-mail demo", async () => {
    mocks.tipsterId = "tipster-demo"
    mocks.channel = null
    mocks.findTipster.mockImplementation(async (id: string) =>
      id === "tipster-demo"
        ? { email: "pro@tipsfy.io", planTier: "PRO" }
        : null,
    )

    const response = await getPageDocument(
      new Request("http://localhost"),
      { params: Promise.resolve({ id: "channel-demo-pro" }) },
    )

    expect(response.status).toBe(404)
    expect(mocks.getPage).not.toHaveBeenCalled()
  })

  it("retorna 400 para body inválido ao aplicar template", async () => {
    const response = await createFromTemplate(
      jsonRequest("POST", { templateId: "unknown" }),
      routeContext,
    )

    expect(response.status).toBe(400)
    expect(mocks.createPage).not.toHaveBeenCalled()
  })

  it("retorna 400 para body inválido ao atualizar documento", async () => {
    const response = await patchPageDocument(
      jsonRequest("PATCH", {}),
      routeContext,
    )

    expect(response.status).toBe(400)
    expect(mocks.updatePage).not.toHaveBeenCalled()
  })

  it("retorna 403 quando o Use Case informa plano Starter", async () => {
    mocks.getPage.mockRejectedValue(
      new RecursoNaoDisponivelNoPlanoError("STARTER"),
    )

    const response = await getPageDocument(
      new Request("http://localhost"),
      routeContext,
    )

    expect(response.status).toBe(403)
  })

  it("retorna 409 ao tentar aplicar template sobre página existente", async () => {
    mocks.createPage.mockRejectedValue(new PaginaJaConfiguradaError())

    const response = await createFromTemplate(
      jsonRequest("POST", { templateId: "clube-essencial" }),
      routeContext,
    )

    expect(response.status).toBe(409)
  })
})
