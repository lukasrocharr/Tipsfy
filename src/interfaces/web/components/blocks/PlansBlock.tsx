import Link from "next/link"
import type { PublicPlan } from "../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

const PERIOD_LABELS = {
  monthly: "por mês",
  quarterly: "por trimestre",
  annual: "por ano",
} as const

export default function PlansBlock({ block }: { block: BlockOfType<"PLANS"> }) {
  const plans = Array.isArray(block.content)
    ? block.content as PublicPlan[]
    : null

  if (!plans) {
    return (
      <section
        className="w-full min-w-0"
        style={blockStyleToCss(block.style)}
        aria-label="Planos"
      >
        <p className="mx-auto max-w-3xl text-sm leading-relaxed opacity-75">
          Os planos disponíveis aparecerão aqui.
        </p>
      </section>
    )
  }

  if (plans.length === 0) {
    return (
      <section
        className="w-full min-w-0"
        style={blockStyleToCss(block.style)}
        aria-label="Planos"
      >
        <p className="mx-auto max-w-3xl text-sm leading-relaxed opacity-75">
          Não há planos ativos no momento.
        </p>
      </section>
    )
  }

  return (
    <section
      className="w-full min-w-0"
      style={blockStyleToCss(block.style)}
      aria-label="Planos disponíveis"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 @sm:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="flex min-w-0 flex-col gap-4 rounded-md border border-current/20 bg-black/5 p-4 @sm:p-5"
          >
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold [overflow-wrap:anywhere]">
                {plan.name}
              </h2>
              {plan.description && (
                <p className="mt-2 text-sm leading-relaxed opacity-80 [overflow-wrap:anywhere]">
                  {plan.description}
                </p>
              )}
            </div>
            <p className="mt-auto text-xl font-semibold tabular-nums">
              {plan.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              <span className="ml-1 text-sm font-normal opacity-75">
                {PERIOD_LABELS[plan.period]}
              </span>
            </p>
            <Link
              href={`/checkout/${encodeURIComponent(plan.checkoutSlug)}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-current/30 px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Assinar
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
