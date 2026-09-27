"use client"

import { useParams } from "next/navigation"
import PageRenderer from "../components/PageRenderer"
import { usePublicPerformance } from "../hooks/usePublicPerformance"

export default function PublicPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? null
  const { data, loading, error } = usePublicPerformance(slug)

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#08080a] px-4 text-zinc-400">
        Carregando página pública…
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#08080a] px-4 text-zinc-400">
        Página pública indisponível no momento.
      </main>
    )
  }

  if (data.pageStatus === "not-configured" || !data.pageDocument) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#08080a] px-4 text-zinc-300">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-zinc-100">
            Esta página ainda não foi configurada
          </h1>
          <p className="mt-2 text-base leading-relaxed text-zinc-400">
            O tipster ainda não publicou o conteúdo desta página.
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-dvh w-full min-w-0 bg-[#08080a]">
      <PageRenderer document={data.pageDocument} tipsterAvatarUrl={data.tipsterAvatarUrl} appearance="dark" />
    </div>
  )
}
