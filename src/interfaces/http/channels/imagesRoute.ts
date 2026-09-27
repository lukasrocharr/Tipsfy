import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { z } from "zod"
import {
  IMAGE_EXTENSION_BY_TYPE,
  MAX_IMAGE_UPLOAD_BYTES,
  SUPPORTED_IMAGE_TYPES,
  type ImageAssetType,
  type SupportedImageType,
} from "../../../domain/services/ImageUploadPolicy"
import { PrismaChannelRepository } from "../../../infrastructure/database/PrismaChannelRepository"
import { PrismaTipsterRepository } from "../../../infrastructure/database/PrismaTipsterRepository"
import { getAuthenticatedTipsterId } from "../auth/session"

const channelParamsSchema = z.object({ id: z.string().trim().min(1) })
const uploadEventSchema = z.object({
  type: z.literal("blob.generate-client-token"),
  payload: z.object({
    pathname: z.string().min(1),
    multipart: z.boolean(),
    clientPayload: z.string().min(1),
  }),
})
const uploadPayloadSchema = z.object({
  channelId: z.string().min(1),
  assetType: z.enum(["hero-banner", "hero-avatar", "block-image"]),
  contentType: z.enum(SUPPORTED_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_IMAGE_UPLOAD_BYTES),
})

function isAllowedPathname(
  pathname: string,
  channelId: string,
  assetType: ImageAssetType,
  contentType: SupportedImageType,
): boolean {
  const segments = pathname.split("/")
  const filename = segments[3] ?? ""
  const extension = IMAGE_EXTENSION_BY_TYPE[contentType]
  return (
    segments.length === 4 &&
    segments[0] === "channels" &&
    segments[1] === channelId &&
    segments[2] === assetType &&
    new RegExp(`^[0-9a-f-]{36}\\.${extension}$`, "i").test(filename)
  )
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
  }

  const parsedParams = channelParamsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 })
  }

  const tipster = await new PrismaTipsterRepository().buscarPorId(tipsterId)
  if (!tipster) {
    return NextResponse.json({ message: "Tipster não encontrado." }, { status: 401 })
  }
  if (tipster.planTier !== "PRO") {
    return NextResponse.json(
      { message: "Este recurso é exclusivo para o plano PRO." },
      { status: 403 },
    )
  }

  const channel = await new PrismaChannelRepository().buscarPorId(
    parsedParams.data.id,
  )
  if (!channel || channel.tipsterId !== tipsterId) {
    return NextResponse.json({ message: "Canal não encontrado." }, { status: 404 })
  }

  const requestBody = await request.json().catch(() => null)
  const parsedEvent = uploadEventSchema.safeParse(requestBody)
  if (!parsedEvent.success) {
    return NextResponse.json({ message: "Solicitação de upload inválida." }, { status: 400 })
  }

  let rawUploadPayload: unknown
  try {
    rawUploadPayload = JSON.parse(parsedEvent.data.payload.clientPayload)
  } catch {
    return NextResponse.json({ message: "Dados do arquivo inválidos." }, { status: 400 })
  }
  const parsedPayload = uploadPayloadSchema.safeParse(rawUploadPayload)
  if (!parsedPayload.success) {
    const tooLarge =
      typeof rawUploadPayload === "object" &&
      rawUploadPayload !== null &&
      "size" in rawUploadPayload &&
      typeof rawUploadPayload.size === "number" &&
      rawUploadPayload.size > MAX_IMAGE_UPLOAD_BYTES
    return NextResponse.json(
      {
        message: tooLarge
          ? "A imagem deve ter no máximo 5 MB."
          : "Aceitamos apenas imagens JPEG, PNG ou WebP.",
      },
      { status: tooLarge ? 413 : 415 },
    )
  }

  const { channelId, assetType, contentType, size } = parsedPayload.data
  if (channelId !== channel.id) {
    return NextResponse.json({ message: "Canal inválido para este upload." }, { status: 400 })
  }
  if (!isAllowedPathname(parsedEvent.data.payload.pathname, channel.id, assetType, contentType)) {
    return NextResponse.json({ message: "Destino de upload inválido." }, { status: 400 })
  }
  if (!size) {
    return NextResponse.json({ message: "O arquivo está vazio." }, { status: 400 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { message: "Configure BLOB_READ_WRITE_TOKEN para enviar imagens." },
      { status: 503 },
    )
  }

  try {
    const result = await handleUpload({
      request,
      body: parsedEvent.data as HandleUploadBody,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (pathname !== parsedEvent.data.payload.pathname || clientPayload !== parsedEvent.data.payload.clientPayload) {
          throw new Error("Solicitação de upload inválida.")
        }
        return {
          allowedContentTypes: [...SUPPORTED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_UPLOAD_BYTES,
          addRandomSuffix: false,
          validUntil: Date.now() + 5 * 60 * 1000,
        }
      },
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { message: "Não foi possível autorizar o envio da imagem." },
      { status: 502 },
    )
  }
}