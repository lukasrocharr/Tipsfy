import type { PublicPageBlock } from "../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type {
  PageBlock,
  PageBlockStyle,
  PageBlockType,
} from "../../../../domain/entities/PageBlock"

export type RenderablePageBlock = PageBlock | PublicPageBlock
export type BlockOfType<T extends PageBlockType,> = Extract<RenderablePageBlock, {
  type: T
}>
export type { PageBlockStyle }
