import { describe, expect, it } from "vitest"
import { ObterPerformancePublicaUseCase } from "../../src/application/use-cases/channels/ObterPerformancePublicaUseCase"
import { Channel } from "../../src/domain/entities/Channel"
import { PageDocument } from "../../src/domain/entities/PageDocument"
import { Plan } from "../../src/domain/entities/Plan"
import { Tip } from "../../src/domain/entities/Tip"
import { Tipster } from "../../src/domain/entities/Tipster"
import { RecursoNaoDisponivelNoPlanoError } from "../../src/domain/errors/RecursoNaoDisponivelNoPlanoError"
import { PAGE_BUILDER_TEMPLATES } from "../../src/infrastructure/page-builder/templates"

function createPageDocument(): PageDocument {
  return new PageDocument({
    ...structuredClone(PAGE_BUILDER_TEMPLATES["resultados-abertos"]),
    channelId: "channel-1",
    updatedAt: new Date("2026-09-26T00:00:00.000Z"),
  })
}

function createTip(id: string, result: "green" | "red", odds = 2): Tip {
  return new Tip(
    id,
    "channel-1",
    "Futebol",
    "Flamengo x Palmeiras",
    "Resultado",
    odds,
    1,
    result,
    "2026-09-25",
    null,
    "Bet365",
    "Análise",
  )
}

function createPlan(id: string, active: boolean, subscribers: number): Plan {
  return new Plan(
    id,
    "Plano VIP",
    29.9,
    "monthly",
    active,
    "Análises premium",
    "channel-1",
    `checkout-${id}`,
    subscribers,
  )
}

function createContext(
  options: {
    planTier?: "STARTER" | "PRO"
    document?: PageDocument | null
    tips?: Tip[]
    plans?: Plan[]
  } = {},
) {
  const channel = new Channel(
    "channel-1",
    "tipster-1",
    "chat-1",
    "encrypted-token",
    "Canal Premium",
    "canal-premium",
  )
  const tipster = new Tipster(
    "tipster-1",
    "private-tipster@example.com",
    "private-password-hash",
    options.planTier ?? "PRO",
    new Date(),
  )
  const tipRepository = {
    tips: options.tips ?? [createTip("tip-1", "green")],
    async listarPorCanal(channelId: string) {
      return this.tips.filter((tip) => tip.channelId === channelId)
    },
  }
  const pageDocument = options.document ?? null
  const plans = options.plans ?? []
  const useCase = new ObterPerformancePublicaUseCase(
    { buscarPorPublicSlug: async () => channel } as any,
    tipRepository as any,
    { buscarPorId: async () => tipster } as any,
    { obterPorCanal: async () => pageDocument } as any,
    {
      listarPorChannelId: async (channelId: string) =>
        plans.filter((plan) => plan.channelId === channelId),
    } as any,
  )

  return { useCase, tipRepository }
}

describe("ObterPerformancePublicaUseCase", () => {
  it("retorna estado vazio quando ainda não há documento de página", async () => {
    const { useCase } = createContext({ document: null })

    const result = await useCase.execute({ publicSlug: "canal-premium" })

    expect(result.pageStatus).toBe("not-configured")
    expect(result.pageDocument).toBeNull()
    expect(result.channelName).toBe("Canal Premium")
  })

  it("reflete nas estatísticas do bloco STATS as tips alteradas após salvar o documento", async () => {
    const document = createPageDocument()
    const { useCase, tipRepository } = createContext({
      document,
      tips: [createTip("tip-1", "green")],
    })

    const firstRead = await useCase.execute({ publicSlug: "canal-premium" })
    const firstStatsBlock = firstRead.pageDocument?.blocks.find(
      (block) => block.type === "STATS",
    )
    expect(firstStatsBlock?.content).toMatchObject({ total: 1, wins: 1 })

    tipRepository.tips = [
      createTip("tip-1", "green"),
      createTip("tip-2", "red", 1.8),
    ]
    const secondRead = await useCase.execute({ publicSlug: "canal-premium" })
    const secondStatsBlock = secondRead.pageDocument?.blocks.find(
      (block) => block.type === "STATS",
    )

    expect(secondRead.stats).toMatchObject({ total: 2, wins: 1, losses: 1 })
    expect(secondStatsBlock?.content).toEqual(secondRead.stats)
    expect(
      document.blocks.find((block) => block.type === "STATS")?.content,
    ).toEqual({})
  })

  it("insere somente planos ativos e não inclui contagem de assinantes", async () => {
    const { useCase } = createContext({
      document: createPageDocument(),
      plans: [createPlan("active", true, 20), createPlan("inactive", false, 8)],
    })

    const result = await useCase.execute({ publicSlug: "canal-premium" })
    const plansBlock = result.pageDocument?.blocks.find(
      (block) => block.type === "PLANS",
    )

    expect(plansBlock?.content).toHaveLength(1)
    expect(plansBlock?.content[0]).toMatchObject({
      id: "active",
      name: "Plano VIP",
    })
    expect(plansBlock?.content[0]).not.toHaveProperty("subscribers")
    expect(plansBlock?.content[0]).not.toHaveProperty("channelId")
  })

  it("aplica allowlist ao retorno e ao conteúdo persistido dos blocos", async () => {
    const document = createPageDocument()
    const hero = document.blocks.find((block) => block.type === "HERO")
    const statsBlock = document.blocks.find((block) => block.type === "STATS")
    const plansBlock = document.blocks.find((block) => block.type === "PLANS")
    if (!hero || !statsBlock || !plansBlock)
      throw new Error("Template incompleto no teste.")

    Object.assign(hero.content, {
      email: "private-block@example.com",
      payments: ["private-payment"],
    })
    Object.assign(hero.style, {
      subscriberList: ["private-subscriber@example.com"],
    })
    Object.assign(hero, { bankDetails: "private-bank-details" })
    Object.assign(statsBlock.content, { paymentData: "private-stats-payment" })
    Object.assign(plansBlock.content, {
      subscriberEmails: ["private-plan-subscriber@example.com"],
    })

    const { useCase } = createContext({
      document,
      plans: [createPlan("active", true, 20)],
    })

    const result = await useCase.execute({ publicSlug: "canal-premium" })
    const serialized = JSON.stringify(result)

    expect(result.pageStatus).toBe("configured")
    expect(serialized).not.toContain("private-tipster@example.com")
    expect(serialized).not.toContain("private-password-hash")
    expect(serialized).not.toContain("private-block@example.com")
    expect(serialized).not.toContain("private-payment")
    expect(serialized).not.toContain("private-subscriber")
    expect(serialized).not.toContain("private-bank-details")
    expect(result).not.toHaveProperty("payments")
    expect(result).not.toHaveProperty("subscribers")
  })

  it("bloqueia tipster STARTER com RecursoNaoDisponivelNoPlanoError", async () => {
    const { useCase } = createContext({ planTier: "STARTER" })

    await expect(
      useCase.execute({ publicSlug: "canal-premium" }),
    ).rejects.toBeInstanceOf(RecursoNaoDisponivelNoPlanoError)
  })
})
