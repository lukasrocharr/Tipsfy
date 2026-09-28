import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { isReservedPublicChannelSlug, normalizePublicChannelSlug } from "../../../domain/services/publicChannelSlug.mjs"
import { PrismaChannelRepository } from "../../../infrastructure/database/PrismaChannelRepository"
import { pageBuilderUseCasesFactory } from "../../../infrastructure/factories/pageBuilderUseCasesFactory"
import { prisma } from "../../../infrastructure/database/prisma"
import { getAuthenticatedTipsterId } from "../auth/session"
import { pageDocumentErrorResponse } from "./pageDocument/routeUtils"

const paramsSchema = z.object({ id: z.string().trim().min(1) })
const bodySchema = z
  .object({
    pageName: z.string().max(120).refine((value) => value.trim().length > 0),
    publicSlug: z.string().trim().min(1).max(100),
    templateId: z.enum([
      "clube-essencial",
      "dia-de-jogo",
      "resultados-abertos",
      "cartao-do-tipster",
    ]),
    links: z.array(
      z
        .object({
          platform: z.string().trim().min(1).max(40),
          url: z.string().trim().min(1).max(500),
        })
        .strict(),
    ),
  })
  .strict()

class ChannelNotFoundError extends Error {}
class PublicSlugAlreadyInUseError extends Error {}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 })
  }
  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsedBody.success) {
    return NextResponse.json({ message: "Dados da página inválidos." }, { status: 400 })
  }

  const channelId = parsedParams.data.id
  const publicSlug = normalizePublicChannelSlug(parsedBody.data.publicSlug)

  if (isReservedPublicChannelSlug(publicSlug)) {
    return NextResponse.json(
      { message: "Esse link não pode ser usado. Escolha outro slug." },
      { status: 409 },
    )
  }

  try {
    const pageDocument = await prisma.$transaction(async (transaction) => {
      const channelRepository = new PrismaChannelRepository(transaction)
      const channel = await channelRepository.buscarPorId(channelId)
      if (!channel || channel.tipsterId !== tipsterId) {
        throw new ChannelNotFoundError()
      }

      const slugOwner = await channelRepository.buscarPorPublicSlug(publicSlug)
      if (slugOwner && slugOwner.id !== channelId) {
        throw new PublicSlugAlreadyInUseError()
      }

      await channelRepository.atualizarPublicSlug(channelId, publicSlug)
      return await pageBuilderUseCasesFactory(transaction).criarPagina.execute({
        tipsterId,
        channelId,
        templateId: parsedBody.data.templateId,
        pageName: parsedBody.data.pageName,
        links: parsedBody.data.links,
      })
    })

    return NextResponse.json({ pageDocument, publicSlug }, { status: 201 })
  } catch (error) {
    if (error instanceof ChannelNotFoundError) {
      return NextResponse.json({ message: "Canal não encontrado." }, { status: 404 })
    }
    if (
      error instanceof PublicSlugAlreadyInUseError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
    ) {
      return NextResponse.json(
        { message: "Esse link já está em uso. Escolha outro slug." },
        { status: 409 },
      )
    }
    return pageDocumentErrorResponse(error)
  }
}