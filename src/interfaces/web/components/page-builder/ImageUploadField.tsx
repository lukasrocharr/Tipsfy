"use client"

import { useRef, useState } from "react"
import { put } from "@vercel/blob/client"
import { Image as ImageIcon, LoaderCircle, Upload } from "lucide-react"
import {
  IMAGE_EXTENSION_BY_TYPE,
  MAX_IMAGE_UPLOAD_BYTES,
  SUPPORTED_IMAGE_TYPES,
  matchesImageSignature,
  type ImageAssetType,
  type SupportedImageType,
} from "../../../../domain/services/ImageUploadPolicy"

const ACCEPTED_TYPES = SUPPORTED_IMAGE_TYPES.join(",")

export default function ImageUploadField({
  channelId,
  assetType,
  label,
  value,
  onChange,
}: {
  channelId: string
  assetType: ImageAssetType
  label: string
  value: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const isAvatar = assetType === "hero-avatar"

  async function uploadFile(file: File | undefined) {
    if (!file || uploading) return
    setError(null)
    setProgress(0)

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType)) {
      setError("Aceitamos apenas arquivos JPEG, PNG ou WebP.")
      return
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setError("A imagem deve ter no máximo 5 MB.")
      return
    }
    if (file.size === 0) {
      setError("O arquivo está vazio.")
      return
    }

    const contentType = file.type as SupportedImageType
    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (!matchesImageSignature(contentType, signature)) {
      setError("O conteúdo do arquivo não corresponde ao formato da imagem.")
      return
    }

    const pathname = `channels/${channelId}/${assetType}/${crypto.randomUUID()}.${IMAGE_EXTENSION_BY_TYPE[contentType]}`
    const clientPayload = JSON.stringify({
      channelId,
      assetType,
      contentType,
      size: file.size,
    })

    setUploading(true)
    try {
      const tokenResponse = await fetch(
        `/api/channels/${encodeURIComponent(channelId)}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "blob.generate-client-token",
            payload: { pathname, multipart: false, clientPayload },
          }),
        },
      )
      const tokenBody = (await tokenResponse.json().catch(() => null)) as {
        clientToken?: string
        message?: string
      } | null
      if (!tokenResponse.ok || !tokenBody?.clientToken) {
        throw new Error(tokenBody?.message ?? "Não foi possível autorizar o upload.")
      }

      const blob = await put(pathname, file, {
        access: "public",
        token: tokenBody.clientToken,
        contentType,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      })
      onChange(blob.url)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      )
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void uploadFile(event.dataTransfer.files[0])
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-zinc-400">{label}</span>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false)
          }
        }}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-lg border border-dashed bg-[#111114] transition-colors ${
          isAvatar ? "aspect-square max-w-40" : "aspect-[16/6]"
        } ${
          isDragging
            ? "border-emerald-400 bg-emerald-950/30"
            : "border-[#3f3f46]"
        }`}
      >
        {value ? (
          <img
            src={value}
            alt={`Prévia de ${label.toLowerCase()}`}
            className={`absolute inset-0 h-full w-full object-cover ${isAvatar ? "rounded-full" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center text-zinc-500">
            <ImageIcon aria-hidden="true" size={22} />
            <span className="text-xs">Arraste uma imagem aqui ou selecione um arquivo</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          aria-label={`Selecionar arquivo para ${label.toLowerCase()}`}
          className="sr-only"
          onChange={(event) => {
            void uploadFile(event.currentTarget.files?.[0])
            event.currentTarget.value = ""
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-x-2 bottom-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#3f3f46] bg-[#08080a]/90 px-3 text-xs font-medium text-zinc-100 hover:border-emerald-600 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          {uploading ? (
            <>
              <LoaderCircle aria-hidden="true" size={15} className="animate-spin" />
              Enviando {Math.round(progress)}%
            </>
          ) : (
            <>
              <Upload aria-hidden="true" size={15} />
              {value ? "Trocar imagem" : "Selecionar imagem"}
            </>
          )}
        </button>
      </div>

      <details className="text-xs text-zinc-500">
        <summary className="min-h-8 cursor-pointer py-1 hover:text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">
          Colar URL manualmente
        </summary>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…"
          className="mt-1 min-h-10 w-full rounded-lg border border-[#27272a] bg-[#111114] px-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-600"
        />
      </details>

      {error && (
        <p className="text-xs leading-relaxed text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}