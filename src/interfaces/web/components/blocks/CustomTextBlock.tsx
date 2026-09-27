import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function CustomTextBlock({
  block,
}: {
  block: BlockOfType<"CUSTOM_TEXT">
}) {
  return (
    <section className="w-full min-w-0" style={blockStyleToCss(block.style)}>
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="break-words text-2xl font-semibold leading-tight @sm:text-3xl [overflow-wrap:anywhere]">
          {block.content.title}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere]">
          {block.content.paragraph}
        </p>
      </div>
    </section>
  )
}
