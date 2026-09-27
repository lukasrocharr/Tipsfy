"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUpRight, Check, Save } from "lucide-react"
import type {
  PageBlock,
  PageBlockType,
} from "../../../domain/entities/PageBlock"
import { createPageBlock } from "../components/page-builder/blockDefaults"
import BlockPalette from "../components/page-builder/BlockPalette"
import BlockPropertiesPanel from "../components/page-builder/BlockPropertiesPanel"
import PageBuilderCanvas, {
  type PreviewWidth,
} from "../components/page-builder/PageBuilderCanvas"
import TemplateGallery from "../components/page-builder/TemplateGallery"
import type {
  EditablePageDocument,
  EditorChannel,
  TemplateCard,
} from "../components/page-builder/types"
import type { PublicPlan } from "../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type { Plan as ChannelPlan } from "../data"
import UpgradePrompt from "../components/page-builder/UpgradePrompt"

type TemplateResponse = {
  templateId: string
  nome: string
  previewText: string
  thumbnailUrl: string | null
}

async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  return body?.message ?? fallback
}

export default function PageBuilderEditor({
  initialChannelId = "",
}: {
  initialChannelId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [channels, setChannels] = useState<EditorChannel[]>([])
  const [channelId, setChannelId] = useState("")
  const [document, setDocument] = useState<EditablePageDocument | null>(null)
  const [previewPlans, setPreviewPlans] = useState<PublicPlan[]>([])
  const [templates, setTemplates] = useState<TemplateCard[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>(375)
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingDocument, setLoadingDocument] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const response = await fetch("/api/channels")
        if (!response.ok)
          throw new Error(
            await readError(response, "Não foi possível carregar seus canais."),
          )
        const body = (await response.json()) as { channels: EditorChannel[] }
        if (!active) return
        setChannels(body.channels)
        setChannelId((current) =>
          initialChannelId &&
            body.channels.some((channel) => channel.id === initialChannelId)
            ? initialChannelId
            : current && body.channels.some((channel) => channel.id === current)
              ? current
              : (body.channels[0]?.id ?? ""),
        )
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar seus canais.",
          )
      } finally {
        if (active) setLoadingChannels(false)
      }
    })()
    return () => {
      active = false
    }
  }, [initialChannelId])

  useEffect(() => {
    let active = true
    setPreviewPlans([])
    if (!channelId) return () => { active = false }

    void fetch(`/api/channels/${encodeURIComponent(channelId)}/plans`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os planos.")
        const body = (await response.json()) as { plans: ChannelPlan[] }
        if (!active) return
        setPreviewPlans(
          body.plans
            .filter((plan) => plan.active)
            .map((plan) => ({
              id: plan.id,
              name: plan.name,
              price: plan.price,
              period: plan.period,
              checkoutSlug: plan.checkoutSlug,
              description: plan.description ?? null,
            })),
        )
      })
      .catch(() => {
        if (active) setPreviewPlans([])
      })

    return () => { active = false }
  }, [channelId])

  useEffect(() => {
    if (!channelId) {
      setDocument(null)
      setTemplates([])
      return
    }

    let active = true
    void (async () => {
      setLoadingDocument(true)
      setError(null)
      setUpgradeMessage(null)
      setTemplates([])
      try {
        const response = await fetch(
          `/api/channels/${encodeURIComponent(channelId)}/page-document`,
        )
        if (response.status === 403) {
          setUpgradeMessage(
            await readError(
              response,
              "Este recurso é exclusivo para o plano PRO.",
            ),
          )
          setDocument(null)
          return
        }
        if (!response.ok)
          throw new Error(
            await readError(response, "Não foi possível carregar a página."),
          )
        const body = (await response.json()) as {
          pageDocument: EditablePageDocument | null
        }
        if (!active) return
        setDocument(body.pageDocument)
        setDirty(false)
        setSaved(false)
        setSelectedBlockId(body.pageDocument?.blocks[0]?.id ?? null)

        if (!body.pageDocument) {
          setLoadingTemplates(true)
          const templateResponse = await fetch("/api/page-builder/templates")
          if (!templateResponse.ok)
            throw new Error(
              await readError(
                templateResponse,
                "Não foi possível carregar os templates.",
              ),
            )
          const templateBody = (await templateResponse.json()) as {
            templates: TemplateResponse[]
          }
          if (active) {
            setTemplates(
              templateBody.templates.map((template) => ({
                templateId: template.templateId,
                name: template.nome,
                previewText: template.previewText,
                thumbnailUrl: template.thumbnailUrl,
              })),
            )
          }
        }
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar a página.",
          )
      } finally {
        if (active) {
          setLoadingDocument(false)
          setLoadingTemplates(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [channelId])

  const currentChannel =
    channels.find((channel) => channel.id === channelId) ?? null
  const selectedBlock =
    document?.blocks.find((block) => block.id === selectedBlockId) ?? null

  function chooseChannel(nextChannelId: string) {
    if (nextChannelId === channelId) return
    if (
      dirty &&
      !window.confirm("Há alterações não salvas. Descartar e trocar de canal?")
    )
      return
    setDirty(false)
    setSaved(false)
    router.replace(`${pathname}?channelId=${encodeURIComponent(nextChannelId)}`, {
      scroll: false,
    })
  }

  function markEdited() {
    setDirty(true)
    setSaved(false)
    setError(null)
  }

  function addBlock(type: PageBlockType) {
    if (!document) return
    const block = createPageBlock(type, document.globalTheme)
    setDocument((current) =>
      current ? { ...current, blocks: [...current.blocks, block] } : current,
    )
    setSelectedBlockId(block.id)
    markEdited()
  }

  function updateBlock(
    updatedBlock: PageBlock,
    theme?: EditablePageDocument["globalTheme"],
  ) {
    setDocument((current) =>
      current
        ? {
            ...current,
            blocks: current.blocks.map((block) =>
              block.id === updatedBlock.id ? updatedBlock : block,
            ),
            globalTheme: theme ?? current.globalTheme,
          }
        : current,
    )
    markEdited()
  }

  function reorderBlocks(blocks: PageBlock[]) {
    setDocument((current) => (current ? { ...current, blocks } : current))
    markEdited()
  }

  function removeBlock(blockId: string) {
    if (!document) return
    const removedIndex = document.blocks.findIndex(
      (block) => block.id === blockId,
    )
    const blocks = document.blocks.filter((block) => block.id !== blockId)
    setDocument({ ...document, blocks })
    setSelectedBlockId(
      blocks[Math.min(removedIndex, blocks.length - 1)]?.id ?? null,
    )
    markEdited()
  }

  async function applyTemplate(templateId: string) {
    if (!channelId) return
    setApplyingId(templateId)
    setError(null)
    try {
      const response = await fetch(
        `/api/channels/${encodeURIComponent(channelId)}/page-document/from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        },
      )
      if (!response.ok)
        throw new Error(
          await readError(response, "Não foi possível aplicar o template."),
        )
      const body = (await response.json()) as {
        pageDocument: EditablePageDocument
      }
      setDocument(body.pageDocument)
      setSelectedBlockId(body.pageDocument.blocks[0]?.id ?? null)
      setTemplates([])
      setDirty(false)
      setSaved(true)
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Não foi possível aplicar o template.",
      )
    } finally {
      setApplyingId(null)
    }
  }

  async function saveDocument() {
    if (!document || !channelId || !dirty || saving) return
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/channels/${encodeURIComponent(channelId)}/page-document`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: document.templateId,
            blocks: document.blocks,
            globalTheme: document.globalTheme,
          }),
        },
      )
      if (response.status === 403) {
        setUpgradeMessage(
          await readError(
            response,
            "Este recurso é exclusivo para o plano PRO.",
          ),
        )
        return
      }
      if (!response.ok)
        throw new Error(
          await readError(response, "Não foi possível salvar a página."),
        )
      const body = (await response.json()) as {
        pageDocument: EditablePageDocument
      }
      setDocument(body.pageDocument)
      setDirty(false)
      setSaved(true)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar a página.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (upgradeMessage) return <UpgradePrompt message={upgradeMessage} />

  if (loadingChannels) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-sm text-zinc-400">
        Carregando canais…
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-zinc-100">
          Conecte um canal primeiro
        </h1>
        <p className="mt-2 text-base leading-relaxed text-zinc-400">
          A página pública é vinculada a um canal para carregar estatísticas e
          planos.
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

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] min-w-0 flex-col">
      <header className="flex min-w-0 flex-col gap-3 border-b border-[#1e1e24] bg-[#0c0c0f] px-3 py-3 sm:px-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
              Page Builder
            </p>
            <h1 className="text-lg font-semibold text-zinc-100">
              Página pública
            </h1>
          </div>
          {channels.length > 1 ? (
            <label className="min-w-0 text-xs text-zinc-500">
              Canal
              <select
                value={channelId}
                onChange={(event) => chooseChannel(event.target.value)}
                className="mt-1 block min-h-10 w-full max-w-xs rounded-lg border border-[#27272a] bg-[#111114] px-3 text-sm text-zinc-200 sm:mt-0 sm:inline-block sm:ml-2"
              >
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="truncate text-sm text-zinc-400">
              {currentChannel?.name}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {saved && !dirty && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <Check aria-hidden="true" size={15} />
              Salvo
            </span>
          )}
          <button
            type="button"
            onClick={() => void saveDocument()}
            disabled={!document || !dirty || saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save aria-hidden="true" size={16} />
            {saving ? "Salvando…" : "Salvar"}
          </button>
          {currentChannel?.publicSlug ? (
            <a
              href={`/${encodeURIComponent(currentChannel.publicSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#303036] px-3 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
            >
              <ArrowUpRight aria-hidden="true" size={16} />
              Ver página pública
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Defina um slug público para este canal"
              className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-lg border border-[#27272a] px-3 text-sm text-zinc-600"
            >
              <ArrowUpRight aria-hidden="true" size={16} />
              Página sem slug
            </button>
          )}
        </div>
      </header>

      {error && (
        <p
          className="mx-3 mt-3 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-300 sm:mx-4"
          role="alert"
        >
          {error}
        </p>
      )}

      {loadingDocument ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
          Carregando documento…
        </div>
      ) : document ? (
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
          <div className="grid min-w-0 grid-cols-1 content-start gap-3 xl:grid-cols-[13rem_minmax(0,1fr)] xl:items-start">
            <BlockPalette onAdd={addBlock} />
            <BlockPropertiesPanel
              block={selectedBlock}
              globalTheme={document.globalTheme}
              channelId={channelId}
              onChange={updateBlock}
              onRemove={removeBlock}
            />
          </div>
          <PageBuilderCanvas
            blocks={document.blocks}
            plans={previewPlans}
            selectedBlockId={selectedBlockId}
            previewWidth={previewWidth}
            onPreviewWidthChange={setPreviewWidth}
            onSelectBlock={setSelectedBlockId}
            onReorder={reorderBlocks}
          />
        </main>
      ) : (
        <TemplateGallery
          templates={templates}
          loading={loadingTemplates}
          applyingId={applyingId}
          onChoose={(templateId) => void applyTemplate(templateId)}
        />
      )}
    </div>
  )
}
