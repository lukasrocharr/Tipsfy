import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function DividerBlock({
  block,
}: {
  block: BlockOfType<"DIVIDER">
}) {
  return (
    <div className="w-full min-w-0" style={blockStyleToCss(block.style)}>
      <hr
        aria-hidden="true"
        className="mx-auto w-full max-w-6xl border-0 border-t border-current/30"
      />
    </div>
  )
}
