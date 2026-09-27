import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function BioBlock({ block }: { block: BlockOfType<"BIO"> }) {
  return (
    <section className="w-full min-w-0" style={blockStyleToCss(block.style)}>
      <p className="mx-auto w-full max-w-3xl whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere]">
        {block.content.text}
      </p>
    </section>
  )
}
