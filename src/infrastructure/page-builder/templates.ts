import type { PageDocument } from "../../domain/entities/PageDocument"
import type {
  PageDocumentTemplate,
  PageTemplateCatalog,
  PageTemplateDefinition,
  PageTemplateId,
} from "../../application/ports/PageTemplateCatalog"

export type {
  PageDocumentTemplate,
  PageTemplateId,
} from "../../application/ports/PageTemplateCatalog"

export const PAGE_BUILDER_TEMPLATES: Record<PageTemplateId, PageDocumentTemplate> =
  {
    "clube-essencial": {
      templateId: "clube-essencial",
      updatedAt: new Date("2026-09-26T00:00:00.000Z"),
      globalTheme: {
        primaryColorId: "b2b-professional",
        fontPairingId: "modern-professional",
      },
      blocks: [
        {
          id: "11000000-0000-4000-8000-000000000001",
          type: "HERO",
          content: {
            bannerUrl: "/images/banner-placeholder.jpg",
            avatarUrl: "/images/avatar-placeholder.jpg",
            title: "Análises claras para escolher melhor",
            subtitle: "Leitura pré-jogo e contexto, sem ruído.",
          },
          style: {
            backgroundColor: "#0F172A",
            textColor: "#FFFFFF",
            fontFamily: "Poppins",
            alignment: "left",
            padding: 24,
          },
        },
        {
          id: "11000000-0000-4000-8000-000000000002",
          type: "BIO",
          content: {
            text: "Sou [nome], analista de [modalidade]. Compartilho meu método e minhas leituras de cada rodada.",
          },
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#020617",
            fontFamily: "Open Sans",
            alignment: "left",
            padding: 24,
          },
        },
        {
          id: "11000000-0000-4000-8000-000000000003",
          type: "DIVIDER",
          content: {},
          style: {
            backgroundColor: "#E8ECF1",
            textColor: "#020617",
            fontFamily: "Open Sans",
            alignment: "center",
            padding: 8,
          },
        },
        {
          id: "11000000-0000-4000-8000-000000000004",
          type: "PLANS",
          content: {},
          style: {
            backgroundColor: "#F8FAFC",
            textColor: "#020617",
            fontFamily: "Open Sans",
            alignment: "left",
            padding: 16,
          },
        },
        {
          id: "11000000-0000-4000-8000-000000000005",
          type: "SOCIAL_LINKS",
          content: {
            links: [
              {
                platform: "Instagram",
                url: "https://instagram.com/seu-perfil",
              },
              { platform: "Telegram", url: "https://t.me/seu-canal" },
            ],
          },
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#0369A1",
            fontFamily: "Open Sans",
            alignment: "left",
            padding: 16,
          },
        },
      ],
    },
    "dia-de-jogo": {
      templateId: "dia-de-jogo",
      updatedAt: new Date("2026-09-26T00:00:00.000Z"),
      globalTheme: {
        primaryColorId: "sports-team-club",
        fontPairingId: "bold-statement",
      },
      blocks: [
        {
          id: "22000000-0000-4000-8000-000000000001",
          type: "HERO",
          content: {
            bannerUrl: "/images/banner-estadio-placeholder.jpg",
            avatarUrl: "/images/avatar-placeholder.jpg",
            title: "A LEITURA COMEÇA ANTES DO APITO",
            subtitle: "Análises independentes para acompanhar cada rodada.",
          },
          style: {
            backgroundColor: "#DC2626",
            textColor: "#FFFFFF",
            fontFamily: "Bebas Neue",
            alignment: "center",
            padding: 32,
          },
        },
        {
          id: "22000000-0000-4000-8000-000000000002",
          type: "STATS",
          content: {},
          style: {
            backgroundColor: "#FEF2F2",
            textColor: "#7F1D1D",
            fontFamily: "Source Sans 3",
            alignment: "center",
            padding: 20,
          },
        },
        {
          id: "22000000-0000-4000-8000-000000000003",
          type: "CUSTOM_TEXT",
          content: {
            title: "Plano de jogo",
            paragraph:
              "Contexto, critérios e leitura de mercado explicados antes de cada partida.",
          },
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#7F1D1D",
            fontFamily: "Source Sans 3",
            alignment: "left",
            padding: 20,
          },
        },
        {
          id: "22000000-0000-4000-8000-000000000004",
          type: "IMAGE",
          content: {
            url: "/images/metodo-placeholder.svg",
            caption: "Como preparo uma análise.",
          },
          style: {
            backgroundColor: "#FEF2F2",
            textColor: "#7F1D1D",
            fontFamily: "Source Sans 3",
            alignment: "center",
            padding: 16,
          },
        },
        {
          id: "22000000-0000-4000-8000-000000000005",
          type: "PLANS",
          content: {},
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#7F1D1D",
            fontFamily: "Source Sans 3",
            alignment: "center",
            padding: 20,
          },
        },
        {
          id: "22000000-0000-4000-8000-000000000006",
          type: "SOCIAL_LINKS",
          content: {
            links: [
              {
                platform: "Instagram",
                url: "https://instagram.com/seu-perfil",
              },
              { platform: "Telegram", url: "https://t.me/seu-canal" },
            ],
          },
          style: {
            backgroundColor: "#DC2626",
            textColor: "#FFFFFF",
            fontFamily: "Source Sans 3",
            alignment: "center",
            padding: 16,
          },
        },
      ],
    },
    "resultados-abertos": {
      templateId: "resultados-abertos",
      updatedAt: new Date("2026-09-26T00:00:00.000Z"),
      globalTheme: {
        primaryColorId: "analytics-dashboard",
        fontPairingId: "sports-fitness",
      },
      blocks: [
        {
          id: "33000000-0000-4000-8000-000000000001",
          type: "HERO",
          content: {
            bannerUrl: "/images/analise-placeholder.jpg",
            avatarUrl: "/images/avatar-placeholder.jpg",
            title: "Acompanhe cada decisão com contexto",
            subtitle: "Histórico e critérios à vista.",
          },
          style: {
            backgroundColor: "#1E40AF",
            textColor: "#FFFFFF",
            fontFamily: "Barlow Condensed",
            alignment: "left",
            padding: 24,
          },
        },
        {
          id: "33000000-0000-4000-8000-000000000002",
          type: "STATS",
          content: {},
          style: {
            backgroundColor: "#E9EEF6",
            textColor: "#1E3A8A",
            fontFamily: "Barlow Condensed",
            alignment: "center",
            padding: 20,
          },
        },
        {
          id: "33000000-0000-4000-8000-000000000003",
          type: "BIO",
          content: {
            text: "Sou [nome]; publico análises de [modalidades] com critérios consistentes.",
          },
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#1E3A8A",
            fontFamily: "Barlow",
            alignment: "left",
            padding: 20,
          },
        },
        {
          id: "33000000-0000-4000-8000-000000000004",
          type: "CUSTOM_TEXT",
          content: {
            title: "Critério antes do palpite",
            paragraph:
              "Cada leitura considera cenário, mercado e gestão de risco.",
          },
          style: {
            backgroundColor: "#F8FAFC",
            textColor: "#1E3A8A",
            fontFamily: "Barlow",
            alignment: "left",
            padding: 20,
          },
        },
        {
          id: "33000000-0000-4000-8000-000000000005",
          type: "PLANS",
          content: {},
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#1E3A8A",
            fontFamily: "Barlow",
            alignment: "left",
            padding: 20,
          },
        },
        {
          id: "33000000-0000-4000-8000-000000000006",
          type: "SOCIAL_LINKS",
          content: {
            links: [
              {
                platform: "Instagram",
                url: "https://instagram.com/seu-perfil",
              },
              { platform: "Telegram", url: "https://t.me/seu-canal" },
            ],
          },
          style: {
            backgroundColor: "#1E40AF",
            textColor: "#FFFFFF",
            fontFamily: "Barlow",
            alignment: "left",
            padding: 16,
          },
        },
      ],
    },
    "cartao-do-tipster": {
      templateId: "cartao-do-tipster",
      updatedAt: new Date("2026-09-26T00:00:00.000Z"),
      globalTheme: {
        primaryColorId: "link-in-bio-blue",
        fontPairingId: "bauhaus-geometric",
      },
      blocks: [
        {
          id: "44000000-0000-4000-8000-000000000001",
          type: "HERO",
          content: {
            bannerUrl: "/images/banner-placeholder.jpg",
            avatarUrl: "/images/avatar-placeholder.jpg",
            title: "[Nome do tipster]",
            subtitle: "[Modalidade] · análises independentes.",
          },
          style: {
            backgroundColor: "#2563EB",
            textColor: "#FFFFFF",
            fontFamily: "Outfit",
            alignment: "center",
            padding: 12,
          },
        },
        {
          id: "44000000-0000-4000-8000-000000000002",
          type: "BIO",
          content: {
            text: "Análises e contexto para quem acompanha [modalidade].",
          },
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#0F172A",
            fontFamily: "Outfit",
            alignment: "center",
            padding: 12,
          },
        },
        {
          id: "44000000-0000-4000-8000-000000000003",
          type: "STATS",
          content: {},
          style: {
            backgroundColor: "#F1F5FD",
            textColor: "#0F172A",
            fontFamily: "Outfit",
            alignment: "center",
            padding: 12,
          },
        },
        {
          id: "44000000-0000-4000-8000-000000000004",
          type: "PLANS",
          content: {},
          style: {
            backgroundColor: "#FFFFFF",
            textColor: "#0F172A",
            fontFamily: "Outfit",
            alignment: "center",
            padding: 12,
          },
        },
        {
          id: "44000000-0000-4000-8000-000000000005",
          type: "SOCIAL_LINKS",
          content: {
            links: [
              {
                platform: "Instagram",
                url: "https://instagram.com/seu-perfil",
              },
              { platform: "Telegram", url: "https://t.me/seu-canal" },
            ],
          },
          style: {
            backgroundColor: "#7C3AED",
            textColor: "#FFFFFF",
            fontFamily: "Outfit",
            alignment: "center",
            padding: 12,
          },
        },
      ],
    },
  }

const TEMPLATE_NAMES: Record<PageTemplateId, string> = {
  "clube-essencial": "Clube Essencial",
  "dia-de-jogo": "Dia de Jogo",
  "resultados-abertos": "Resultados Abertos",
  "cartao-do-tipster": "Cartão do Tipster",
}

export class StaticPageTemplateCatalog implements PageTemplateCatalog {
  listar(): PageTemplateDefinition[] {
    return (Object.keys(PAGE_BUILDER_TEMPLATES) as PageTemplateId[]).map(
      (templateId) => this.toDefinition(templateId),
    )
  }

  obterPorId(templateId: PageTemplateId): PageTemplateDefinition | null {
    if (
      !Object.prototype.hasOwnProperty.call(PAGE_BUILDER_TEMPLATES, templateId)
    ) {
      return null
    }
    return this.toDefinition(templateId)
  }

  private toDefinition(templateId: PageTemplateId): PageTemplateDefinition {
    const document = PAGE_BUILDER_TEMPLATES[templateId]
    const hero = document.blocks.find(
      (block): block is Extract<typeof document.blocks[number], {
        type: "HERO"
      }> => block.type === "HERO",
    )

    return {
      templateId,
      name: TEMPLATE_NAMES[templateId],
      previewText: hero
        ? `${hero.content.title} — ${hero.content.subtitle}`
        : "",
      thumbnailUrl: hero?.content.bannerUrl ?? null,
      document,
    }
  }
}
