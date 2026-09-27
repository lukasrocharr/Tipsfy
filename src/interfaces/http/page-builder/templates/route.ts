import { NextResponse } from "next/server"
import { pageBuilderUseCasesFactory } from "../../../../infrastructure/factories/pageBuilderUseCasesFactory"
import { getAuthenticatedTipsterId } from "../../auth/session"

export async function GET() {
  const tipsterId = await getAuthenticatedTipsterId()
  if (!tipsterId) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
  }

  const templates = pageBuilderUseCasesFactory().listarTemplates.execute()
  return NextResponse.json({ templates })
}
