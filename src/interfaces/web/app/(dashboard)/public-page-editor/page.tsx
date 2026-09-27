import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { RecursoNaoDisponivelNoPlanoError } from "../../../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import { PrismaTipsterRepository } from "../../../../../infrastructure/database/PrismaTipsterRepository"
import { authOptions } from "../../../../../infrastructure/factories/authOptions"
import UpgradePrompt from "../../../components/page-builder/UpgradePrompt"
import SalesPageEntry from "../../../screens/SalesPageEntry"

export default async function PublicPageEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ channelId?: string | string[] }>
}) {
  const session = await getServerSession(authOptions)
  const tipsterId = session?.user?.id
  if (!tipsterId) redirect("/login")

  const tipster = await new PrismaTipsterRepository().buscarPorId(tipsterId)
  if (!tipster) redirect("/login")

  if (tipster.planTier === "STARTER") {
    return (
      <UpgradePrompt
        message={new RecursoNaoDisponivelNoPlanoError("STARTER").message}
      />
    )
  }

  const query = await searchParams
  const initialChannelId =
    typeof query.channelId === "string" ? query.channelId : ""

  return <SalesPageEntry initialChannelId={initialChannelId} />
}
