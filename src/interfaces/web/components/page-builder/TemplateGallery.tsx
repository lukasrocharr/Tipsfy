import { ArrowRight } from "lucide-react"
import type { TemplateCard } from "./types"

export default function TemplateGallery({
  templates,
  loading,
  applyingId,
  onChoose,
}: {
  templates: TemplateCard[]
  loading: boolean
  applyingId: string | null
  onChoose: (templateId: string) => void
}) {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"
      aria-labelledby="template-gallery-heading"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Comece por um modelo
        </p>
        <h1
          id="template-gallery-heading"
          className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl"
        >
          Escolha um template
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-zinc-400">
          Você poderá personalizar blocos, cores e tipografia antes de publicar.
        </p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          Carregando templates…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {templates.map((template) => {
            const hasThumbnail =
              template.thumbnailUrl &&
              !template.thumbnailUrl.toLowerCase().includes("placeholder")
            return (
              <button
                key={template.templateId}
                type="button"
                onClick={() => onChoose(template.templateId)}
                disabled={applyingId !== null}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#27272a] bg-[#0c0c0f] text-left transition-colors hover:border-emerald-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:cursor-wait disabled:opacity-60"
              >
                <div className="relative flex aspect-[16/8] w-full items-end overflow-hidden bg-[#111114] p-4">
                  {hasThumbnail && (
                    <img
                      src={template.thumbnailUrl!}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/35 to-transparent"
                  />
                  <p className="relative z-10 max-w-full text-base font-semibold leading-snug text-zinc-100 [overflow-wrap:anywhere]">
                    {template.previewText}
                  </p>
                </div>
                <div className="flex min-w-0 items-center gap-3 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold text-zinc-100">
                      {template.name}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      Usar este template
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    className="shrink-0 text-emerald-400 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
