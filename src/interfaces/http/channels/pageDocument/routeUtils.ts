import { NextResponse } from "next/server"
import { EstiloInvalidoError } from "../../../../domain/errors/EstiloInvalidoError"
import { PaginaJaConfiguradaError } from "../../../../domain/errors/PaginaJaConfiguradaError"
import { RecursoNaoDisponivelNoPlanoError } from "../../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import { PrismaChannelRepository } from "../../../../infrastructure/database/PrismaChannelRepository"

const DEMO_TIPSTER_ID = "tipster-pro-demo"
const DEMO_CHANNEL_ID = "channel-demo-pro"

function isDemoPageBuilderAccess(id: string, tipsterId: string) {
  return id === DEMO_CHANNEL_ID && tipsterId === DEMO_TIPSTER_ID
}

export async function isOwnedChannel(
  id: string,
  tipsterId: string,
): Promise<boolean> {
  if (isDemoPageBuilderAccess(id, tipsterId)) return true
  const channel = await new PrismaChannelRepository().buscarPorId(id)
  return channel?.tipsterId === tipsterId
}

export function pageDocumentErrorResponse(error: unknown): NextResponse {
  console.error("pageDocumentErrorResponse", error)
  if (error instanceof RecursoNaoDisponivelNoPlanoError) {
    return NextResponse.json({ message: error.message }, { status: 403 })
  }
  if (error instanceof PaginaJaConfiguradaError) {
    return NextResponse.json({ message: error.message }, { status: 409 })
  }
  if (error instanceof EstiloInvalidoError || error instanceof RangeError) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
  return NextResponse.json(
    { message: "Não foi possível processar a página." },
    { status: 500 },
  )
}
