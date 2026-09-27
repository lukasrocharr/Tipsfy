import { RecursoNaoDisponivelNoPlanoError } from "../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"

const DEMO_TEST_EMAIL = "pro@tipsfy.io"
const DEMO_CHANNEL_ID = "channel-demo-pro"

export async function validarAcessoPageBuilder(
  tipsterId: string,
  channelId: string,
  channelRepository: ChannelRepository,
  tipsterRepository: TipsterRepository,
): Promise<void> {
  const tipster = await tipsterRepository.buscarPorId(tipsterId)

  if (
    channelId === DEMO_CHANNEL_ID &&
    tipster?.email.trim().toLowerCase() === DEMO_TEST_EMAIL
  ) {
    if (tipster.planTier === "PRO") return
  }

  const channel = await channelRepository.buscarPorId(channelId)
  if (!channel || channel.tipsterId !== tipsterId) {
    throw new Error("Canal não encontrado ou não pertence ao tipster.")
  }

  if (!tipster) throw new Error("Tipster não encontrado.")

  if (tipster.planTier === "STARTER") {
    throw new RecursoNaoDisponivelNoPlanoError(tipster.planTier)
  }
}
