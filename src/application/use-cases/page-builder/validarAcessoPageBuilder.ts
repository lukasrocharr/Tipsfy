import { RecursoNaoDisponivelNoPlanoError } from "../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"

const DEMO_TIPSTER_ID = "tipster-pro-demo"
const DEMO_CHANNEL_ID = "channel-demo-pro"

export async function validarAcessoPageBuilder(
  tipsterId: string,
  channelId: string,
  channelRepository: ChannelRepository,
  tipsterRepository: TipsterRepository,
): Promise<void> {
  if (channelId === DEMO_CHANNEL_ID && tipsterId === DEMO_TIPSTER_ID) {
    const tipster = await tipsterRepository.buscarPorId(tipsterId)
    if (tipster && tipster.planTier === "PRO") return
  }

  const channel = await channelRepository.buscarPorId(channelId)
  if (!channel || channel.tipsterId !== tipsterId) {
    throw new Error("Canal não encontrado ou não pertence ao tipster.")
  }

  const tipster = await tipsterRepository.buscarPorId(tipsterId)
  if (!tipster) throw new Error("Tipster não encontrado.")

  if (tipster.planTier === "STARTER") {
    throw new RecursoNaoDisponivelNoPlanoError(tipster.planTier)
  }
}
