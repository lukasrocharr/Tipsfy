import { NextResponse } from "next/server"
import { z } from "zod"
import { pageBuilderUseCasesFactory } from "../../../../../infrastructure/factories/pageBuilderUseCasesFactory"
import { getAuthenticatedTipsterId } from "../../../auth/session"
import { applyTemplateBodySchema } from "../pageDocumentSchema"
import { isOwnedChannel, pageDocumentErrorResponse } from "../routeUtils"

const paramsSchema = z.object({ id: z.string().trim().min(1) })

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
  const { id } = parsedParams.data

  if (!(await isOwnedChannel(id, tipsterId))) {
    return NextResponse.json({ message: "Canal não encontrado." }, {
      status: 404,
    })
  }

  if (tipsterId === "tipster-pro-demo" && id === "channel-demo-pro") {
    const parsedBody = applyTemplateBodySchema.safeParse(
      await request.json().catch(() => null),
    )
    if (!parsedBody.success) {
      return NextResponse.json({ message: "Template inválido." }, { status: 400 })
    }

    const template = PAGE_BUILDER_TEMPLATES[parsedBody.data.templateId]
    if (!template) {
      return NextResponse.json({ message: "Template inválido." }, { status: 400 })
    }

    const pageDocument = new PageDocument({
      channelId: id,
      templateId: template.templateId,
      blocks: structuredClone(template.blocks),
      globalTheme: { ...template.globalTheme },
      updatedAt: new Date(),
    })

    return NextResponse.json({ pageDocument }, { status: 201 })
  }

  const parsedBody = applyTemplateBodySchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsedBody.success) {
    return NextResponse.json({ message: "Template inválido." }, { status: 400 })
  }

  try {
    const pageDocument = await pageBuilderUseCasesFactory().criarPagina.execute(
      {
        tipsterId,
        channelId: id,
        templateId: parsedBody.data.templateId,
      },
    )
    return NextResponse.json({ pageDocument }, { status: 201 })
  } catch (error) {
    return pageDocumentErrorResponse(error)
  }
}
