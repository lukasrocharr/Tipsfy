import { NextResponse } from "next/server"
import { z } from "zod"
import type { PageBlock } from "../../../../domain/entities/PageBlock"
import {
  PageDocument,
  type GlobalTheme,
  type PageDocumentProps,
} from "../../../../domain/entities/PageDocument"
import { PAGE_BUILDER_TEMPLATES } from "../../../../infrastructure/page-builder/templates"
import { pageBuilderUseCasesFactory } from "../../../../infrastructure/factories/pageBuilderUseCasesFactory"
import { getAuthenticatedTipsterId } from "../../auth/session"
import { pageDocumentBodySchema } from "./pageDocumentSchema"
import { isOwnedChannel, pageDocumentErrorResponse } from "./routeUtils"

const paramsSchema = z.object({ id: z.string().trim().min(1) })

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 })
  }
  const { id } = parsedParams.data

  if (!(await isOwnedChannel(id, tipsterId))) {
    return NextResponse.json({ message: "Canal não encontrado." }, {
      status: 404,
    })
  }

  if (tipsterId === "tipster-pro-demo" && id === "channel-demo-pro") {
    const template = PAGE_BUILDER_TEMPLATES["clube-essencial"]
    const fallbackDocument = new PageDocument({
      channelId: id,
      templateId: template.templateId,
      blocks: structuredClone(template.blocks),
      globalTheme: { ...template.globalTheme },
      updatedAt: new Date(),
    })
    return NextResponse.json({ pageDocument: fallbackDocument })
  }

  try {
    const pageDocument = await pageBuilderUseCasesFactory().obterPagina.execute(
      {
        tipsterId,
        channelId: id,
      },
    )
    return NextResponse.json({ pageDocument })
  } catch (error) {
    return pageDocumentErrorResponse(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ message: "Canal inválido." }, { status: 400 })
  }
  const { id } = parsedParams.data

  if (!(await isOwnedChannel(id, tipsterId))) {
    return NextResponse.json({ message: "Canal não encontrado." }, {
      status: 404,
    })
  }

  if (tipsterId === "tipster-pro-demo" && id === "channel-demo-pro") {
    const parsedBody = pageDocumentBodySchema.safeParse(
      await request.json().catch(() => null),
    )
    if (!parsedBody.success) {
      return NextResponse.json({ message: "Documento da página inválido." }, {
        status: 400,
      })
    }

    const document: PageDocumentProps = {
      channelId: id,
      templateId: parsedBody.data.templateId,
      blocks: parsedBody.data.blocks as unknown as PageBlock[],
      globalTheme: parsedBody.data.globalTheme as GlobalTheme,
      updatedAt: new Date(),
    }

    return NextResponse.json({ pageDocument: new PageDocument(document) })
  }

  const parsedBody = pageDocumentBodySchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsedBody.success) {
    return NextResponse.json({ message: "Documento da página inválido." }, {
      status: 400,
    })
  }

  const document: PageDocumentProps = {
    channelId: id,
    templateId: parsedBody.data.templateId,
    blocks: parsedBody.data.blocks as unknown as PageBlock[],
    globalTheme: parsedBody.data.globalTheme as GlobalTheme,
    updatedAt: new Date(),
  }

  try {
    const pageDocument =
      await pageBuilderUseCasesFactory().atualizarPagina.execute({
        tipsterId,
        channelId: id,
        document,
      })
    return NextResponse.json({ pageDocument })
  } catch (error) {
    return pageDocumentErrorResponse(error)
  }
}
