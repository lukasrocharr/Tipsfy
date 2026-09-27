"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { EditorChannel } from "../components/page-builder/types"
import type { SocialLink } from "../../../domain/entities/PageBlock"

type SlugAvailability = {
  slug: string
  available: boolean
  suggestion?: string
}

export type SalesPageCreationInput = {
  pageName: string
  publicSlug: string
  templateId: "clube-essencial"
  links: SocialLink[]
}

const SOCIAL_FIELDS = [
  { key: "Instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "X/Twitter", label: "X / Twitter", placeholder: "https://x.com/…" },
  { key: "YouTube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "TikTok", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "WhatsApp", label: "WhatsApp", placeholder: "https://wa.me/…" },
] as const

async function checkSlugAvailability(
  channelId: string,
  candidate: string,
): Promise<SlugAvailability> {
  const query = new URLSearchParams({ slug: candidate })
  const response = await fetch(
    `/api/channels/${encodeURIComponent(channelId)}/public-slug-availability?${query}`,
  )
  const body = (await response.json().catch(() => null)) as
    | (SlugAvailability & { message?: string })
    | null
  if (!response.ok || !body) {
    throw new Error(body?.message ?? "Não foi possível validar o link.")
  }
  return body
}

export default function SalesPageCreationWizard({
  channel,
  onComplete,
}: {
  channel: EditorChannel
  onComplete: (input: SalesPageCreationInput) => Promise<void>
}) {
  const [step, setStep] = useState(0)
  const [pageName, setPageName] = useState(channel.name)
  const [slug, setSlug] = useState("")
  const [availability, setAvailability] = useState<
    | { status: "idle" | "checking" | "available" | "unavailable" | "error"; suggestion?: string; message?: string }
  >({ status: "idle" })
  const [socials, setSocials] = useState<Record<string, string>>({})
  const [preparingLink, setPreparingLink] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestNumber = useRef(0)

  useEffect(() => {
    if (step !== 1 || !slug.trim()) return
    const currentRequest = ++requestNumber.current
    const timeout = window.setTimeout(async () => {
      setAvailability({ status: "checking" })
      try {
        const result = await checkSlugAvailability(channel.id, slug)
        if (requestNumber.current !== currentRequest) return
        if (result.slug !== slug) setSlug(result.slug)
        setAvailability({
          status: result.available ? "available" : "unavailable",
          suggestion: result.suggestion,
        })
      } catch (checkError) {
        if (requestNumber.current !== currentRequest) return
        setAvailability({
          status: "error",
          message:
            checkError instanceof Error
              ? checkError.message
              : "Não foi possível validar o link.",
        })
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [channel.id, slug, step])

  async function prepareSlug() {
    const trimmedName = pageName.trim()
    if (!trimmedName) {
      setError("Informe o nome da página.")
      return
    }
    setError(null)
    setPreparingLink(true)
    try {
      const result = await checkSlugAvailability(channel.id, trimmedName)
      const initialSlug = result.available ? result.slug : result.suggestion
      if (!initialSlug) throw new Error("Não foi possível sugerir um link.")
      setSlug(initialSlug)
      setAvailability({ status: "checking" })
      setStep(1)
    } catch (prepareError) {
      setError(
        prepareError instanceof Error
          ? prepareError.message
          : "Não foi possível preparar o link.",
      )
    } finally {
      setPreparingLink(false)
    }
  }

  async function finish(links: SocialLink[]) {
    if (!slug || availability.status !== "available" || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onComplete({
        pageName,
        publicSlug: slug,
        templateId: "clube-essencial",
        links,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar a página.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  function submitSocials() {
    const links = SOCIAL_FIELDS.flatMap(({ key }) => {
      const url = socials[key]?.trim()
      return url ? [{ platform: key, url }] : []
    })
    void finish(links)
  }

  const steps = ["Nome", "Link", "Redes sociais"]

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-2xl flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 flex items-center">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  index < step
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : index === step
                      ? "border-emerald-500 text-emerald-400"
                      : "border-zinc-800 text-zinc-600"
                }`}
              >
                {index < step ? <Check aria-hidden="true" size={13} /> : index + 1}
              </div>
              <span className={`text-xs ${index === step ? "text-zinc-200" : "text-zinc-600"}`}>
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mb-6 mx-3 h-px w-12 sm:mx-5 sm:w-20 ${index < step ? "bg-emerald-500" : "bg-zinc-800"}`} />
            )}
          </div>
        ))}
      </div>

      <section className="w-full rounded-xl border border-[#1e1e24] bg-[#111114] p-5 sm:p-7">
        {step === 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Etapa 1 de 3</p>
            <h1 className="mt-2 text-xl font-semibold text-zinc-100">Nome da página</h1>
            <p className="mt-1 text-sm text-zinc-400">Escolha como seu canal será apresentado.</p>
            <label className="mt-6 block text-sm font-medium text-zinc-300">
              Nome de exibição
              <input
                autoFocus
                maxLength={120}
                value={pageName}
                onChange={(event) => setPageName(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-[#303036] bg-[#0c0c0f] px-3 text-sm text-zinc-100 outline-none focus:border-emerald-500"
              />
            </label>
            <button
              type="button"
              onClick={() => void prepareSlug()}
              disabled={preparingLink || !pageName.trim()}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
            >
              {preparingLink ? "Preparando link…" : "Continuar"}
              {!preparingLink && <ArrowRight aria-hidden="true" size={16} />}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Etapa 2 de 3</p>
            <h1 className="mt-2 text-xl font-semibold text-zinc-100">Link da página</h1>
            <p className="mt-1 text-sm text-zinc-400">Esse será o endereço público da sua página.</p>
            <div className="mt-6 flex min-w-0 items-center rounded-lg border border-[#303036] bg-[#0c0c0f] focus-within:border-emerald-500">
              <span className="shrink-0 pl-3 text-sm text-zinc-500">tipsfy.com/</span>
              <input
                aria-label="Slug da página"
                autoFocus
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value)
                  setAvailability({ status: "checking" })
                }}
                className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-zinc-100 outline-none"
              />
            </div>
            <div aria-live="polite" className="mt-2 min-h-5 text-sm">
              {availability.status === "checking" && <span className="text-zinc-500">Verificando disponibilidade…</span>}
              {availability.status === "available" && <span className="text-emerald-400">Esse link está disponível.</span>}
              {availability.status === "unavailable" && (
                <span className="text-red-400">
                  Esse link já está em uso.
                  {availability.suggestion && (
                    <button type="button" onClick={() => { setSlug(availability.suggestion!); setAvailability({ status: "checking" }) }} className="ml-1 underline underline-offset-2">
                      Usar {availability.suggestion}
                    </button>
                  )}
                </span>
              )}
              {availability.status === "error" && <span className="text-red-400">{availability.message}</span>}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#303036] px-3 text-sm text-zinc-300 hover:bg-zinc-800/40">
                <ArrowLeft aria-hidden="true" size={16} /> Voltar
              </button>
              <button type="button" onClick={() => setStep(2)} disabled={availability.status !== "available"} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40">
                Continuar <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Etapa 3 de 3</p>
            <h1 className="mt-2 text-xl font-semibold text-zinc-100">Redes sociais</h1>
            <p className="mt-1 text-sm text-zinc-400">Adicione os links que deseja exibir. Todos são opcionais.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <label key={key} className="block text-sm font-medium text-zinc-300">
                  {label}
                  <input
                    type="text"
                    value={socials[key] ?? ""}
                    onChange={(event) => setSocials((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#303036] bg-[#0c0c0f] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500"
                  />
                </label>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep(1)} disabled={submitting} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#303036] px-3 text-sm text-zinc-300 hover:bg-zinc-800/40 disabled:opacity-50">
                <ArrowLeft aria-hidden="true" size={16} /> Voltar
              </button>
              <button type="button" onClick={submitSocials} disabled={submitting || availability.status !== "available"} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50">
                {submitting ? "Criando página…" : "Criar página"}
              </button>
              <button type="button" onClick={() => void finish([])} disabled={submitting || availability.status !== "available"} className="min-h-11 w-full text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-200 disabled:opacity-50">
                Pular redes sociais e criar
              </button>
            </div>
          </>
        )}

        {error && step !== 2 && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
      </section>
    </main>
  )
}