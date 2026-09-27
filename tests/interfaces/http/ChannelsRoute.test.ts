import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  GET as getChannels,
  POST as createChannel,
} from "../../../src/interfaces/http/channels/route"

const mocks = vi.hoisted(() => ({
  tipsterId: "tipster-1" as string | null,
  channels: [] as Array<Record<string, unknown>>,
  createChannel: vi.fn(),
}))

vi.mock("../../../src/interfaces/http/auth/session", () => ({
  getAuthenticatedTipsterId: async () => mocks.tipsterId,
}))

vi.mock("../../../src/infrastructure/database/PrismaChannelRepository", () => ({
  PrismaChannelRepository: class {
    async listarPorTipsterId() {
      return mocks.channels
    }
  },
}))

vi.mock("../../../src/infrastructure/factories/channelUseCaseFactory", () => ({
  criarCanalUseCaseFactory: () => ({ execute: mocks.createChannel }),
}))

describe("rotas de canais", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.tipsterId = "tipster-1"
    mocks.channels = []
  })

  it("retorna a lista real vazia sem fabricar um canal demo", async () => {
    const response = await getChannels()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ channels: [] })
  })

  it("preserva o telegramChatId recebido ao criar um canal", async () => {
    mocks.createChannel.mockImplementation(async (input: Record<string, unknown>) => ({
      id: "channel-1",
      publicSlug: "canal-real",
      ...input,
    }))

    const response = await createChannel(
      new Request("http://localhost/api/channels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          telegramChatId: "-1001234567890",
          botTokenEnc: "encrypted-token",
          name: "Canal real",
        }),
      }),
    )

    expect(response.status).toBe(201)
    expect(mocks.createChannel).toHaveBeenCalledWith({
      tipsterId: "tipster-1",
      telegramChatId: "-1001234567890",
      botTokenEnc: "encrypted-token",
      name: "Canal real",
    })
    expect(await response.json()).toMatchObject({
      channel: { telegramChatId: "-1001234567890", connected: true },
    })
  })
})