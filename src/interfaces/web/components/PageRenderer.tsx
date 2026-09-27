import type { PageDocument } from "../../../domain/entities/PageDocument"
import type {
  PublicPageDocument,
  PublicPageBlock,
} from "../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type { PageBlock } from "../../../domain/entities/PageBlock"
import HeroBlock from "./blocks/HeroBlock"
import BioBlock from "./blocks/BioBlock"
import StatsBlock from "./blocks/StatsBlock"
import PlansBlock from "./blocks/PlansBlock"
import SocialLinksBlock from "./blocks/SocialLinksBlock"
import CustomTextBlock from "./blocks/CustomTextBlock"
import ImageBlock from "./blocks/ImageBlock"
import DividerBlock from "./blocks/DividerBlock"

export type RenderablePageBlock = PageBlock | PublicPageBlock

export type PageRendererProps = {
  document: PageDocument | PublicPageDocument
  tipsterAvatarUrl?: string | null
  appearance?: "editor" | "dark"
} | { blocks: RenderablePageBlock[]; tipsterAvatarUrl?: string | null; appearance?: "editor" | "dark" }

function renderBlock(block: RenderablePageBlock, key: string, tipsterAvatarUrl?: string | null) {
  switch (block.type) {
    case "HERO":
      return <HeroBlock key={key} block={block} tipsterAvatarUrl={tipsterAvatarUrl} />
    case "BIO":
      return <BioBlock key={key} block={block} />
    case "STATS":
      return <StatsBlock key={key} block={block} />
    case "PLANS":
      return <PlansBlock key={key} block={block} />
    case "SOCIAL_LINKS":
      return <SocialLinksBlock key={key} block={block} />
    case "CUSTOM_TEXT":
      return <CustomTextBlock key={key} block={block} />
    case "IMAGE":
      return <ImageBlock key={key} block={block} />
    case "DIVIDER":
      return <DividerBlock key={key} block={block} />
  }
}

export function applyPageAppearance(
  blocks: RenderablePageBlock[],
  appearance: "editor" | "dark",
): RenderablePageBlock[] {
  return appearance === "dark"
    ? blocks.map(block => ({
        ...block,
        style: {
          ...block.style,
          backgroundColor: "var(--tipsfy-black)",
          textColor: "var(--tipsfy-white)",
          fontFamily: "Montserrat",
        },
      }))
    : blocks
}

export default function PageRenderer(props: PageRendererProps) {
  // O editor PB-8 e a página pública usam este mesmo renderer: o que o tipster vê editando deve ser exatamente o que o visitante recebe; qualquer divergência é um bug grave de confiança.
  const blocks =
    "document" in props
      ? props.document.blocks as RenderablePageBlock[]
      : props.blocks
  const tipsterAvatarUrl = props.tipsterAvatarUrl
  const renderedBlocks = applyPageAppearance(blocks, props.appearance ?? "editor")

  return (
    <main className="@container w-full min-w-0">
      {renderedBlocks.map((block, index) => (
        <div
          key={`${block.id}-${index}`}
          data-page-block={block.type}
          className="w-full min-w-0"
        >
          {renderBlock(block, `${block.id}-${index}`, tipsterAvatarUrl)}
        </div>
      ))}
    </main>
  )
}
