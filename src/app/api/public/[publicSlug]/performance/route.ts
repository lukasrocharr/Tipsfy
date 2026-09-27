import { NextResponse } from "next/server"
import { z } from "zod"
import { ObterPerformancePublicaUseCase } from "../../../../../application/use-cases/channels/ObterPerformancePublicaUseCase"
import { PrismaChannelRepository } from "../../../../../infrastructure/database/PrismaChannelRepository"
import { PrismaTipRepository } from "../../../../../infrastructure/database/PrismaTipRepository"
import { PrismaTipsterRepository } from "../../../../../infrastructure/database/PrismaTipsterRepository"
import { PrismaPageDocumentRepository } from "../../../../../infrastructure/database/PrismaPageDocumentRepository"
import { PrismaPlanRepository } from "../../../../../infrastructure/database/PrismaPlanRepository"

const paramsSchema = z.object({
  publicSlug: z.string().min(1),
})

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicSlug: string }> },
) {
  try {
    const { publicSlug } = await context.params
    const parsed = paramsSchema.safeParse({ publicSlug })
    if (!parsed.success) {
      return NextResponse.json({ message: "Slug público inválido." }, {
        status: 400,
      })
    }

    const result = await new ObterPerformancePublicaUseCase(
      new PrismaChannelRepository(),
      new PrismaTipRepository(),
      new PrismaTipsterRepository(),
      new PrismaPageDocumentRepository(),
      new PrismaPlanRepository(),
    ).execute({ publicSlug: parsed.data.publicSlug })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Public performance lookup failed", error)
    if (
      error instanceof Error &&
      error.name === "RecursoNaoDisponivelNoPlanoError"
    ) {
      return NextResponse.json({ message: error.message }, { status: 403 })
    }

    return NextResponse.json({ message: "Página pública indisponível." }, {
      status: 404,
    })
  }
}
