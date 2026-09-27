import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function ImageBlock({ block }: { block: BlockOfType<"IMAGE"> }) {
  const hasImage = block.content.url.trim().length > 0

  return (
    <figure className="m-0 w-full min-w-0" style={blockStyleToCss(block.style)}>
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-md">
        {hasImage ? (
          <img
            src={block.content.url}
            alt={block.content.caption ?? ""}
            loading="lazy"
            className="block aspect-[16/9] h-auto max-h-[70vh] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center border border-dashed border-current/25 px-4 text-center text-sm opacity-70">
            Adicione uma URL de imagem no painel de propriedades
          </div>
        )}
      </div>
      {block.content.caption && (
        <figcaption className="mx-auto mt-3 w-full max-w-6xl text-sm leading-relaxed opacity-75 [overflow-wrap:anywhere]">
          {block.content.caption}
        </figcaption>
      )}
    </figure>
  )
}
