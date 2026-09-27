import { AlignCenter, AlignLeft, AlignRight, Plus, Trash2 } from "lucide-react"
import {
  PALETAS_CURADAS,
  PAREAMENTOS_DE_FONTES,
  type FontPairingId,
  type PrimaryColorId,
} from "../../../../domain/value-objects/CatalogoDeEstilo"
import type { GlobalTheme } from "../../../../domain/entities/PageDocument"
import type {
  PageBlock,
  PageBlockStyle,
} from "../../../../domain/entities/PageBlock"
import ImageUploadField from "./ImageUploadField"

const FIELD_CLASS =
  "mt-1 w-full min-w-0 rounded-lg border border-[#27272a] bg-[#111114] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-700/40"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block min-w-0 text-xs font-medium text-zinc-400">
      <span>{label}</span>
      {children}
    </label>
  )
}

function updateBlockContent(
  block: PageBlock,
  field: string,
  value: string,
): PageBlock {
  switch (block.type) {
    case "HERO":
      return { ...block, content: { ...block.content, [field]: value } }
    case "BIO":
      return { ...block, content: { text: value } }
    case "CUSTOM_TEXT":
      return { ...block, content: { ...block.content, [field]: value } }
    case "IMAGE":
      return { ...block, content: { ...block.content, [field]: value } }
    default:
      return block
  }
}

function fontForBlock(
  pairingId: FontPairingId,
  block: PageBlock,
): PageBlockStyle["fontFamily"] {
  const pairing = PAREAMENTOS_DE_FONTES[pairingId]
  return block.type === "HERO" || block.type === "CUSTOM_TEXT"
    ? pairing.heading
    : pairing.body
}

export default function BlockPropertiesPanel({
  block,
  globalTheme,
  channelId,
  onChange,
  onRemove,
}: {
  block: PageBlock | null
  globalTheme: GlobalTheme | null
  channelId: string
  onChange: (block: PageBlock, theme?: GlobalTheme) => void
  onRemove: (blockId: string) => void
}) {
  if (!block || !globalTheme) {
    return (
      <aside
        className="min-w-0 rounded-xl border border-[#1e1e24] bg-[#0c0c0f] p-4"
        aria-label="Propriedades do bloco"
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Propriedades
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          Selecione um bloco no canvas para editar conteúdo e estilo.
        </p>
      </aside>
    )
  }

  const selectedBlock = block
  const selectedTheme = globalTheme
  const setText = (field: string, value: string) =>
    onChange(updateBlockContent(block, field, value))
  const paletteIds = Object.keys(PALETAS_CURADAS) as PrimaryColorId[]
  const pairingIds = Object.keys(PAREAMENTOS_DE_FONTES) as FontPairingId[]

  function choosePalette(primaryColorId: PrimaryColorId) {
    const palette = PALETAS_CURADAS[primaryColorId]
    onChange(
      {
        ...selectedBlock,
        style: {
          ...selectedBlock.style,
          backgroundColor: palette.primary,
          textColor: palette.onPrimary,
        },
      },
      { ...selectedTheme, primaryColorId },
    )
  }

  function choosePairing(fontPairingId: FontPairingId) {
    onChange(
      {
        ...selectedBlock,
        style: {
          ...selectedBlock.style,
          fontFamily: fontForBlock(fontPairingId, selectedBlock),
        },
      },
      { ...selectedTheme, fontPairingId },
    )
  }

  function updateStyle(style: Partial<PageBlockStyle>) {
    onChange({ ...selectedBlock, style: { ...selectedBlock.style, ...style } })
  }

  return (
    <aside
      className="min-w-0 rounded-xl border border-[#1e1e24] bg-[#0c0c0f]"
      aria-label="Propriedades do bloco"
    >
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-[#1e1e24] px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Propriedades
          </h2>
          <p className="mt-1 truncate text-sm font-medium text-zinc-200">
            {block.type.replace(/_/g, " ")}
          </p>
        </div>
        <button
          type="button"
          aria-label="Remover bloco"
          onClick={() => onRemove(block.id)}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-2 text-xs text-red-300 hover:bg-red-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          <Trash2 aria-hidden="true" size={15} />
          Remover
        </button>
      </div>

      <div className="max-h-[min(68dvh,48rem)] space-y-5 overflow-y-auto p-4 xl:max-h-[calc(100dvh-14rem)]">
        <section className="space-y-3" aria-labelledby="block-content-heading">
          <h3
            id="block-content-heading"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Conteúdo
          </h3>

          {block.type === "HERO" && (
            <>
              <Field label="Título">
                <input
                  className={FIELD_CLASS}
                  value={block.content.title}
                  maxLength={160}
                  onChange={(event) => setText("title", event.target.value)}
                />
              </Field>
              <Field label="Subtítulo">
                <textarea
                  className={`${FIELD_CLASS} resize-y`}
                  rows={3}
                  value={block.content.subtitle}
                  maxLength={240}
                  onChange={(event) => setText("subtitle", event.target.value)}
                />
              </Field>
              <ImageUploadField
                channelId={channelId}
                assetType="hero-banner"
                label="Banner"
                value={block.content.bannerUrl}
                onChange={(value) => setText("bannerUrl", value)}
              />
              <ImageUploadField
                channelId={channelId}
                assetType="hero-avatar"
                label="Avatar"
                value={block.content.avatarUrl}
                onChange={(value) => setText("avatarUrl", value)}
              />
            </>
          )}

          {block.type === "BIO" && (
            <Field label="Biografia">
              <textarea
                className={`${FIELD_CLASS} resize-y`}
                rows={6}
                maxLength={2000}
                value={block.content.text}
                onChange={(event) => setText("text", event.target.value)}
              />
            </Field>
          )}

          {block.type === "CUSTOM_TEXT" && (
            <>
              <Field label="Título">
                <input
                  className={FIELD_CLASS}
                  value={block.content.title}
                  maxLength={120}
                  onChange={(event) => setText("title", event.target.value)}
                />
              </Field>
              <Field label="Parágrafo">
                <textarea
                  className={`${FIELD_CLASS} resize-y`}
                  rows={6}
                  maxLength={2000}
                  value={block.content.paragraph}
                  onChange={(event) => setText("paragraph", event.target.value)}
                />
              </Field>
            </>
          )}

          {block.type === "IMAGE" && (
            <>
              <ImageUploadField
                channelId={channelId}
                assetType="block-image"
                label="Imagem"
                value={block.content.url}
                onChange={(value) => setText("url", value)}
              />
              <Field label="Legenda">
                <input
                  className={FIELD_CLASS}
                  value={block.content.caption ?? ""}
                  maxLength={180}
                  onChange={(event) => setText("caption", event.target.value)}
                />
              </Field>
            </>
          )}

          {block.type === "SOCIAL_LINKS" && (
            <div className="space-y-3">
              {block.content.links.map((link, index) => (
                <div
                  key={`${link.platform}-${index}`}
                  className="space-y-2 rounded-lg border border-[#1e1e24] p-3"
                >
                  <Field label="Rede">
                    <input
                      className={FIELD_CLASS}
                      value={link.platform}
                      maxLength={40}
                      onChange={(event) => {
                        const links = block.content.links.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, platform: event.target.value }
                              : item,
                        )
                        onChange({ ...block, content: { links } })
                      }}
                    />
                  </Field>
                  <Field label="URL">
                    <input
                      className={FIELD_CLASS}
                      type="url"
                      value={link.url}
                      placeholder="https://…"
                      onChange={(event) => {
                        const links = block.content.links.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, url: event.target.value }
                              : item,
                        )
                        onChange({ ...block, content: { links } })
                      }}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        content: {
                          links: block.content.links.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        },
                      })
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs text-red-300 hover:bg-red-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    Remover link
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    content: {
                      links: [
                        ...block.content.links,
                        { platform: "Nova rede", url: "" },
                      ],
                    },
                  })
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#3f3f46] px-3 text-sm text-zinc-300 hover:border-emerald-700/60 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Plus aria-hidden="true" size={16} />
                Adicionar link
              </button>
            </div>
          )}

          {(block.type === "STATS" || block.type === "PLANS") && (
            <p className="rounded-lg border border-[#1e1e24] bg-[#111114] p-3 text-sm leading-relaxed text-zinc-400">
              {block.type === "STATS"
                ? "Os indicadores são calculados ao vivo a partir das tips do canal."
                : "A lista é carregada ao vivo com os planos ativos do canal."}
            </p>
          )}

          {block.type === "DIVIDER" && (
            <p className="text-sm leading-relaxed text-zinc-500">
              Este bloco é apenas visual e não possui conteúdo editável.
            </p>
          )}
        </section>

        <section
          className="space-y-3 border-t border-[#1e1e24] pt-4"
          aria-labelledby="block-style-heading"
        >
          <h3
            id="block-style-heading"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Estilo
          </h3>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-zinc-400">
              Paleta
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {paletteIds.map((paletteId) => {
                const palette = PALETAS_CURADAS[paletteId]
                const selected = globalTheme.primaryColorId === paletteId
                return (
                  <button
                    key={paletteId}
                    type="button"
                    aria-label={`Aplicar paleta ${paletteId.replace(/-/g, " ")}`}
                    aria-pressed={selected}
                    onClick={() => choosePalette(paletteId)}
                    className={`min-h-12 min-w-0 rounded-lg border p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                      selected
                        ? "border-emerald-500 bg-emerald-950/20"
                        : "border-[#27272a] bg-[#111114] hover:border-zinc-500"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="mb-1 flex h-4 overflow-hidden rounded-sm"
                    >
                      <span
                        className="flex-1"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <span
                        className="flex-1"
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <span
                        className="flex-1"
                        style={{ backgroundColor: palette.accent }}
                      />
                    </span>
                    <span className="block truncate text-[10px] capitalize text-zinc-300">
                      {paletteId.replace(/-/g, " ")}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Field label="Pareamento tipográfico">
            <select
              className={FIELD_CLASS}
              value={globalTheme.fontPairingId}
              onChange={(event) => {
                const fontPairingId = event.target.value as FontPairingId
                onChange(
                  {
                    ...block,
                    style: {
                      ...block.style,
                      fontFamily: fontForBlock(fontPairingId, block),
                    },
                  },
                  { ...globalTheme, fontPairingId },
                )
              }}
            >
              {pairingIds.map((fontPairingId) => {
                const pairing = PAREAMENTOS_DE_FONTES[fontPairingId]
                return (
                  <option key={fontPairingId} value={fontPairingId}>
                    {fontPairingId.replace(/-/g, " ")} · {pairing.heading} /{" "}
                    {pairing.body}
                  </option>
                )
              })}
            </select>
          </Field>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-zinc-400">
              Alinhamento
            </legend>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#27272a] bg-[#111114] p-1">
              {[
                { value: "left", label: "Esquerda", Icon: AlignLeft },
                { value: "center", label: "Centro", Icon: AlignCenter },
                { value: "right", label: "Direita", Icon: AlignRight },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  aria-pressed={block.style.alignment === value}
                  onClick={() =>
                    updateStyle({
                      alignment: value as PageBlockStyle["alignment"],
                    })
                  }
                  className={`flex min-h-10 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                    block.style.alignment === value
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <Icon aria-hidden="true" size={17} />
                </button>
              ))}
            </div>
          </fieldset>

          <Field label={`Espaçamento interno · ${block.style.padding}px`}>
            <input
              className="mt-2 w-full accent-emerald-500"
              type="range"
              min="0"
              max="64"
              step="4"
              value={block.style.padding}
              onChange={(event) =>
                updateStyle({ padding: Number(event.target.value) })
              }
            />
          </Field>
        </section>
      </div>
    </aside>
  )
}
