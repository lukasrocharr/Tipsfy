import { Plus } from "lucide-react"
import { PAGE_BLOCK_OPTIONS } from "./types"
import type { PageBlockType } from "./types"

export default function BlockPalette({
  onAdd,
}: {
  onAdd: (type: PageBlockType) => void
}) {
  return (
    <section
      className="min-w-0 rounded-xl border border-[#1e1e24] bg-[#0c0c0f] p-3"
      aria-labelledby="block-palette-heading"
    >
      <h2
        id="block-palette-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500"
      >
        Blocos
      </h2>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
        {PAGE_BLOCK_OPTIONS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-lg border border-[#1e1e24] bg-[#111114] px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:border-emerald-700/50 hover:bg-emerald-950/20 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <span className="min-w-0 break-words">{label}</span>
            <Plus
              aria-hidden="true"
              size={16}
              className="shrink-0 text-emerald-400"
            />
          </button>
        ))}
      </div>
    </section>
  )
}
