"use client"

import { useEffect, useRef, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { GripVertical, Monitor, Smartphone } from "lucide-react"
import PageRenderer from "../PageRenderer"
import type { PageBlock } from "../../../../domain/entities/PageBlock"
import type { PublicPlan } from "../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import type { PublicPageBlock } from "../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import { PAGE_BLOCK_OPTIONS } from "./types"

export type PreviewWidth = 375 | 1440

function SortableBlock({
  block,
  selected,
  scale,
  plans,
  onSelect,
}: {
  block: PageBlock
  selected: boolean
  scale: number
  plans: PublicPlan[]
  onSelect: () => void
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })
  const transformStyle = transform
    ? `translate3d(${transform.x / scale}px, ${transform.y / scale}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
    : undefined
  const label =
    PAGE_BLOCK_OPTIONS.find((option) => option.type === block.type)?.label ??
    block.type
  const previewBlock = block.type === "PLANS"
    ? { ...block, content: plans } as Extract<PublicPageBlock, { type: "PLANS" }>
    : block

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: transformStyle,
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 2 : undefined,
      }}
      className={`min-w-0 overflow-hidden rounded-lg border bg-[#0c0c0f] ${
        selected
          ? "border-emerald-500/80 ring-1 ring-emerald-500/40"
          : "border-[#27272a]"
      }`}
    >
      <header className="flex min-w-0 items-center gap-2 border-b border-[#1e1e24] px-2 py-1.5">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="min-h-10 min-w-0 flex-1 truncate px-2 text-left text-xs font-medium text-zinc-300 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          {label}
        </button>
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Arrastar para reordenar: ${label}`}
          className="flex h-10 w-10 shrink-0 touch-none items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <GripVertical aria-hidden="true" size={18} />
        </button>
      </header>
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none min-w-0 select-none"
      >
        <PageRenderer blocks={[previewBlock]} />
      </div>
    </article>
  )
}

export default function PageBuilderCanvas({
  blocks,
  plans,
  selectedBlockId,
  previewWidth,
  onPreviewWidthChange,
  onSelectBlock,
  onReorder,
}: {
  blocks: PageBlock[]
  plans: PublicPlan[]
  selectedBlockId: string | null
  previewWidth: PreviewWidth
  onPreviewWidthChange: (width: PreviewWidth) => void
  onSelectBlock: (id: string) => void
  onReorder: (blocks: PageBlock[]) => void
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const documentRef = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [documentHeight, setDocumentHeight] = useState(0)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const scale =
    availableWidth > 0
      ? Math.min(1, Math.max(0.1, (availableWidth - 24) / previewWidth))
      : 1

  useEffect(() => {
    const viewport = viewportRef.current
    const document = documentRef.current
    if (!viewport || !document) return

    const measure = () => {
      setAvailableWidth(viewport.clientWidth)
      setDocumentHeight(document.scrollHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(document)
    return () => observer.disconnect()
  }, [blocks, previewWidth])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((block) => block.id === active.id)
    const newIndex = blocks.findIndex((block) => block.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = [...blocks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered)
  }

  return (
    <section
      className="min-w-0 rounded-xl border border-[#1e1e24] bg-[#0c0c0f]"
      aria-label="Canvas da página"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e1e24] px-3 py-3 sm:px-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Canvas</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Arraste pelo ícone para reordenar.
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-[#27272a] bg-[#111114] p-1"
          role="group"
          aria-label="Largura do preview"
        >
          <button
            type="button"
            aria-pressed={previewWidth === 375}
            onClick={() => onPreviewWidthChange(375)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
              previewWidth === 375
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            <Smartphone aria-hidden="true" size={16} />
            Mobile
          </button>
          <button
            type="button"
            aria-pressed={previewWidth === 1440}
            onClick={() => onPreviewWidthChange(1440)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
              previewWidth === 1440
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            <Monitor aria-hidden="true" size={16} />
            Desktop
          </button>
        </div>
      </header>

      <div ref={viewportRef} className="min-w-0 overflow-auto p-3 sm:p-4">
        <div
          className="mx-auto overflow-hidden rounded-lg border border-[#27272a] bg-[#08080a] shadow-xl"
          style={{
            width: previewWidth * scale,
            height: Math.max(160, documentHeight * scale),
          }}
          data-preview-width={previewWidth}
        >
          <div ref={documentRef} style={{ width: previewWidth, zoom: scale }}>
            {blocks.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-zinc-500">
                Adicione um bloco pela paleta para começar.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((block) => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-w-0 space-y-2 p-2">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        plans={plans}
                        selected={block.id === selectedBlockId}
                        scale={scale}
                        onSelect={() => onSelectBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
