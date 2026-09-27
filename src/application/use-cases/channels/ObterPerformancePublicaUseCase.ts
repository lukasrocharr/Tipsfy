import { ObterEstatisticasDoCanalUseCase } from "../tips/ObterEstatisticasDoCanalUseCase"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { PageDocumentRepository } from "../../ports/PageDocumentRepository"
import type { PlanRepository } from "../../ports/PlanRepository"
import type { TipRepository } from "../../ports/TipRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"
import { RecursoNaoDisponivelNoPlanoError } from "../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import type {
  PageBlock,
  PageBlockStyle,
} from "../../../domain/entities/PageBlock"
import type { PageDocument } from "../../../domain/entities/PageDocument"
import type { Plan } from "../../../domain/entities/Plan"

export type ChannelStatistics = Awaited<ReturnType<ObterEstatisticasDoCanalUseCase["execute"]>>

export type PublicPlan = Pick<Plan, "id" | "name" | "price" | "period" | "checkoutSlug"> & {
  description: string | null
}

type PublicStatsBlock = Omit<Extract<PageBlock, {
  type: "STATS"
}>, "content"> & { content: ChannelStatistics }

type PublicPlansBlock = Omit<Extract<PageBlock, {
  type: "PLANS"
}>, "content"> & { content: PublicPlan[] }

export type PublicPageBlock = Exclude<PageBlock, {
  type: "STATS" | "PLANS"
}> | PublicStatsBlock | PublicPlansBlock

export type PublicPageDocument = Pick<PageDocument, "channelId" | "templateId" | "globalTheme" | "updatedAt"> & {
  blocks: PublicPageBlock[]
}

export type PublicPerformanceResult = {
  pageStatus: "configured" | "not-configured"
  pageDocument: PublicPageDocument | null
  channelName: string
  tipsterAvatarUrl: string | null
  stats: ChannelStatistics
  recentTips: Array<{
    id: string
    sport: string
    event: string
    market: string
    odds: number
    units: number
    result: "green" | "red" | "void" | "pending"
    date: string
    bookmaker: string | null
  }>
}

export class ObterPerformancePublicaUseCase {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly tipRepository: TipRepository,
    private readonly tipsterRepository: TipsterRepository,
    private readonly pageDocumentRepository: PageDocumentRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(input: {
    publicSlug: string
  }): Promise<PublicPerformanceResult> {
    const channel = await this.channelRepository.buscarPorPublicSlug(
      input.publicSlug,
    )

    if (!channel) {
      throw new Error("Página pública não encontrada.")
    }

    const tipster = await this.tipsterRepository.buscarPorId(channel.tipsterId)
    if (!tipster) throw new Error("Tipster não encontrado.")

    if (tipster.planTier === "STARTER") {
      throw new RecursoNaoDisponivelNoPlanoError(tipster.planTier)
    }

    const [stats, pageDocument] = await Promise.all([
      new ObterEstatisticasDoCanalUseCase(this.tipRepository).execute({
        channelId: channel.id,
      }),
      this.pageDocumentRepository.obterPorCanal(channel.id),
    ])

    const recentTips = (await this.tipRepository.listarPorCanal(channel.id))
      .filter((tip) => tip.result !== "pending")
      .slice(0, 8)
      .map((tip) => ({
        id: tip.id,
        sport: tip.sport,
        event: tip.event,
        market: tip.market,
        odds: tip.odds,
        units: tip.units,
        result: tip.result,
        date: tip.date,
        bookmaker: tip.bookmaker,
      }))

    const hasPlansBlock =
      pageDocument?.blocks.some((block) => block.type === "PLANS") ?? false
    const activePlans: PublicPlan[] = hasPlansBlock
      ? (await this.planRepository.listarPorChannelId(channel.id))
          .filter((plan) => plan.active)
          .map((plan) => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            period: plan.period,
            checkoutSlug: plan.checkoutSlug,
            description: plan.description ?? null,
          }))
      : []

    const publicPageDocument: PublicPageDocument | null = pageDocument
      ? {
          channelId: pageDocument.channelId,
          templateId: pageDocument.templateId,
          globalTheme: {
            primaryColorId: pageDocument.globalTheme.primaryColorId,
            fontPairingId: pageDocument.globalTheme.fontPairingId,
          },
          updatedAt: pageDocument.updatedAt,
          blocks: pageDocument.blocks.map((block) =>
            this.toPublicBlock(block, stats, activePlans),
          ),
        }
      : null

    // NUNCA devem sair daqui: email do tipster, pagamentos, lista de assinantes,
    // token/credenciais, dados bancários, histórico financeiro sensível, contagem de
    // assinantes e qualquer propriedade extra do documento ou de seus blocos.
    const publicView: PublicPerformanceResult = {
      pageStatus: publicPageDocument ? "configured" : "not-configured",
      pageDocument: publicPageDocument,
      channelName: channel.name,
      tipsterAvatarUrl: tipster.profilePhotoUrl,
      stats,
      recentTips,
    }

    return publicView
  }

  private toPublicBlock(
    block: PageBlock,
    stats: ChannelStatistics,
    plans: PublicPlan[],
  ): PublicPageBlock {
    const style: PageBlockStyle = {
      backgroundColor: block.style.backgroundColor,
      textColor: block.style.textColor,
      fontFamily: block.style.fontFamily,
      alignment: block.style.alignment,
      padding: block.style.padding,
    }

    switch (block.type) {
      case "HERO":
        return {
          id: block.id,
          type: block.type,
          style,
          content: {
            bannerUrl: block.content.bannerUrl,
            avatarUrl: block.content.avatarUrl,
            title: block.content.title,
            subtitle: block.content.subtitle,
          },
        }
      case "BIO":
        return {
          id: block.id,
          type: block.type,
          style,
          content: { text: block.content.text },
        }
      case "STATS":
        return { id: block.id, type: block.type, style, content: stats }
      case "PLANS":
        return { id: block.id, type: block.type, style, content: plans }
      case "SOCIAL_LINKS":
        return {
          id: block.id,
          type: block.type,
          style,
          content: {
            links: block.content.links.map(({ platform, url }) => ({
              platform,
              url,
            })),
          },
        }
      case "CUSTOM_TEXT":
        return {
          id: block.id,
          type: block.type,
          style,
          content: {
            title: block.content.title,
            paragraph: block.content.paragraph,
          },
        }
      case "IMAGE":
        return {
          id: block.id,
          type: block.type,
          style,
          content: { url: block.content.url, caption: block.content.caption },
        }
      case "DIVIDER":
        return { id: block.id, type: block.type, style, content: {} }
    }
  }
}
