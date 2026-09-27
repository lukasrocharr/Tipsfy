import { NextResponse } from "next/server"
import { z } from "zod"
import { generateUniquePublicChannelSlug, normalizePublicChannelSlug } from "../../../domain/services/publicChannelSlug.mjs"
import { PrismaChannelRepository } from "../../../infrastructure/database/PrismaChannelRepository"
import { PrismaTipsterRepository } from "../../../infrastructure/database/PrismaTipsterRepository"
import { getAuthenticatedTipsterId } from "../auth/session"
import { isOwnedChannel } from "./pageDocument/routeUtils"

const paramsSchema = z.object({ id: z.string().trim().min(1) })

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
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

  const parsedParams = paramsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 })
  }
  const { id: channelId } = parsedParams.data

  if (!(await isOwnedChannel(channelId, tipsterId))) {
    return NextResponse.json({ message: "Canal não encontrado." }, { status: 404 })
  }

  const parsedQuery = z
    .object({ slug: z.string().trim().min(1) })
    .safeParse({ slug: new URL(request.url).searchParams.get("slug") })
  if (!parsedQuery.success) {
    return NextResponse.json({ message: "Slug inválido." }, { status: 400 })
  }

  const publicSlug = normalizePublicChannelSlug(parsedQuery.data.slug)
  const channelRepository = new PrismaChannelRepository()
  const currentOwner = await channelRepository.buscarPorPublicSlug(publicSlug)
  if (!currentOwner || currentOwner.id === channelId) {
    return NextResponse.json({ slug: publicSlug, available: true })
  }

  const suggestion = await generateUniquePublicChannelSlug(
    publicSlug,
    async (candidate) => {
      const owner = await channelRepository.buscarPorPublicSlug(candidate)
      return Boolean(owner && owner.id !== channelId)
    },
  )

  return NextResponse.json({
    slug: publicSlug,
    available: false,
    suggestion,
  })
}