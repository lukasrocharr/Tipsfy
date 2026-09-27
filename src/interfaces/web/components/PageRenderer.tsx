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
} | { blocks: RenderablePageBlock[] }

function renderBlock(block: RenderablePageBlock, key: string) {
  switch (block.type) {
    case "HERO":
      return <HeroBlock key={key} block={block} />
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

export default function PageRenderer(props: PageRendererProps) {
  // O editor PB-8 e a página pública usam este mesmo renderer: o que o tipster vê editando deve ser exatamente o que o visitante recebe; qualquer divergência é um bug grave de confiança.
  const blocks =
    "document" in props
      ? props.document.blocks as RenderablePageBlock[]
      : props.blocks

  return (
    <main className="@container w-full min-w-0">
      {blocks.map((block, index) => (
        <div
          key={`${block.id}-${index}`}
          data-page-block={block.type}
          className="w-full min-w-0"
        >
          {renderBlock(block, `${block.id}-${index}`)}
        </div>
      ))}
    </main>
  )
}
