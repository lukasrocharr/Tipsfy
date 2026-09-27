import type { ChannelStatistics } from "../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function StatsBlock({ block }: { block: BlockOfType<"STATS"> }) {
  const content = block.content as Partial<ChannelStatistics>
  const hasLiveStats = typeof content.total === "number"

  if (!hasLiveStats) {
    return (
      <section
        className="w-full min-w-0"
        style={blockStyleToCss(block.style)}
        aria-label="Estatísticas"
      >
        <p className="mx-auto max-w-3xl text-sm leading-relaxed opacity-75">
          As estatísticas atualizadas aparecerão aqui.
        </p>
      </section>
    )
  }

  const metrics = [
    {
      label: "ROI",
      value: `${content.roi! >= 0 ? "+" : ""}${content.roi!.toFixed(1)}%`,
    },
    { label: "Aproveitamento", value: `${content.winRate!.toFixed(1)}%` },
    { label: "Tips encerradas", value: `${content.settled}` },
    {
      label: "Lucro",
      value: `${content.profit! >= 0 ? "+" : ""}${content.profit!.toFixed(2)}u`,
    },
  ]

  return (
    <section
      className="w-full min-w-0"
      style={blockStyleToCss(block.style)}
      aria-label="Estatísticas de performance"
    >
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 @sm:gap-4 @md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-md border border-current/15 bg-black/5 p-3 @sm:p-4"
          >
            <dt className="text-xs font-medium uppercase tracking-wide opacity-75">
              {metric.label}
            </dt>
            <dd className="mt-2 break-words text-xl font-semibold tabular-nums @sm:text-2xl [overflow-wrap:anywhere]">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
