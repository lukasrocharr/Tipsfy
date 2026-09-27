import type {
  PageBlock,
  PageBlockStyle,
  PageBlockType,
} from "../../../../domain/entities/PageBlock"
import type { GlobalTheme } from "../../../../domain/entities/PageDocument"

export type EditorChannel = {
  id: string
  name: string
  publicSlug: string | null
}

export type EditablePageDocument = {
  channelId: string
  templateId: string
  blocks: PageBlock[]
  globalTheme: GlobalTheme
  updatedAt: string
}

export type TemplateCard = {
  templateId: string
  name: string
  previewText: string
  thumbnailUrl: string | null
}

export const PAGE_BLOCK_OPTIONS: Array<{ type: PageBlockType; label: string }> = [
  { type: "HERO", label: "Destaque" },
  { type: "BIO", label: "Biografia" },
  { type: "STATS", label: "Estatísticas" },
  { type: "PLANS", label: "Planos" },
  { type: "SOCIAL_LINKS", label: "Redes sociais" },
  { type: "CUSTOM_TEXT", label: "Texto livre" },
  { type: "IMAGE", label: "Imagem" },
  { type: "DIVIDER", label: "Separador" },
]

export type { GlobalTheme, PageBlock, PageBlockStyle, PageBlockType }
