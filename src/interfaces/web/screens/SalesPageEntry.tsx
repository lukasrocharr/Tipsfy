"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import PageBuilderEditor from "./PageBuilderEditor"
import SalesPageCreationWizard, {
  type SalesPageCreationInput,
} from "./SalesPageCreationWizard"
import type {
  EditablePageDocument,
  EditorChannel,
} from "../components/page-builder/types"

type EntryState =
  | "loading"
  | "select-channel"
  | "checking"
  | "configured"
  | "unconfigured"
  | "error"

export default function SalesPageEntry({
  initialChannelId,
}: {
  initialChannelId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [channels, setChannels] = useState<EditorChannel[]>([])
  const [channelsLoaded, setChannelsLoaded] = useState(false)
  const [entryState, setEntryState] = useState<EntryState>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetch("/api/channels")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os canais.")
        const body = (await response.json()) as { channels: EditorChannel[] }
        if (active) setChannels(body.channels)
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os canais.",
          )
          setEntryState("error")
        }
      })
      .finally(() => {
        if (active) setChannelsLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  const selectedChannel = channels.find(
    (channel) => channel.id === initialChannelId,
  )

  useEffect(() => {
    if (!channelsLoaded) return
    if (channels.length === 0) {
      setEntryState("unconfigured")
      return
    }
    if (channels.length === 1 && !initialChannelId) {
      router.replace(
        `${pathname}?channelId=${encodeURIComponent(channels[0].id)}`,
        { scroll: false },
      )
      return
    }
    if (!selectedChannel) {
      setEntryState("select-channel")
      return
    }

    let active = true
    setEntryState("checking")
    setError(null)
    void fetch(
      `/api/channels/${encodeURIComponent(selectedChannel.id)}/page-document`,
    )
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as {
          pageDocument?: EditablePageDocument | null
          message?: string
        } | null
        if (!response.ok) {
          throw new Error(body?.message ?? "Não foi possível carregar a página.")
        }
        if (!active) return
        setEntryState(body?.pageDocument ? "configured" : "unconfigured")
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar a página.",
          )
          setEntryState("error")
        }
      })

    return () => {
      active = false
    }
  }, [channels, channelsLoaded, initialChannelId, pathname, router, selectedChannel])

  function selectChannel(channelId: string) {
    if (!channelId) return
    router.replace(`${pathname}?channelId=${encodeURIComponent(channelId)}`, {
      scroll: false,
    })
  }

  if (
    entryState === "loading" ||
    entryState === "checking" ||
    (channels.length === 1 && !initialChannelId)
  ) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-sm text-zinc-400">
        Carregando página de vendas…
      </div>
    )
  }

  if (entryState === "error") {
    return (
      <p
        className="mx-auto mt-8 max-w-xl px-4 text-sm text-red-300"
        role="alert"
      >
        {error}
      </p>
    )
  }

  if (channels.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-zinc-100">
          Crie um canal primeiro
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          A página de vendas precisa estar vinculada a um canal.
        </p>
        <Link
          href="/settings"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Configurar canal
        </Link>
      </main>
    )
  }

  if (entryState === "select-channel") {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4">
        <div className="w-full rounded-xl border border-[#27272a] bg-[#0c0c0f] p-5">
          <h1 className="text-lg font-semibold text-zinc-100">Escolha um canal</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Selecione qual canal terá a página de vendas.
          </p>
          <label className="mt-5 block text-sm text-zinc-300">
            Canal
            <select
              aria-label="Canal da página de vendas"
              defaultValue=""
              onChange={(event) => selectChannel(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-[#303036] bg-[#111114] px-3 text-sm text-zinc-100"
            >
              <option value="" disabled>
                Selecione um canal
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </main>
    )
  }

  if (entryState === "configured" && selectedChannel) {
    return (
      <PageBuilderEditor
        key={selectedChannel.id}
        initialChannelId={selectedChannel.id}
      />
    )
  }

  if (entryState === "unconfigured" && selectedChannel) {
    return (
      <SalesPageCreationWizard
        channel={selectedChannel}
        onComplete={async (input) => {
          const response = await fetch(
            `/api/channels/${encodeURIComponent(selectedChannel.id)}/sales-page`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            },
          )
          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
              message?: string
            } | null
            throw new Error(body?.message ?? "Não foi possível criar a página.")
          }
          setEntryState("configured")
        }}
      />
    )
  }

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold text-zinc-100">
        Crie sua página de vendas
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        O canal {selectedChannel?.name} ainda não tem uma página configurada.
      </p>
    </main>
  )
}