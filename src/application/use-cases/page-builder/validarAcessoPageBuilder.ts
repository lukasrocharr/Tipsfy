import { RecursoNaoDisponivelNoPlanoError } from "../../../domain/errors/RecursoNaoDisponivelNoPlanoError"
import type { ChannelRepository } from "../../ports/ChannelRepository"
import type { TipsterRepository } from "../../ports/TipsterRepository"

export async function validarAcessoPageBuilder(
  tipsterId: string,
  channelId: string,
  channelRepository: ChannelRepository,
  tipsterRepository: TipsterRepository,
): Promise<void> {
  const tipster = await tipsterRepository.buscarPorId(tipsterId)

  const channel = await channelRepository.buscarPorId(channelId)
  if (!channel || channel.tipsterId !== tipsterId) {
    throw new Error("Canal não encontrado ou não pertence ao tipster.")
  }

  if (!tipster) throw new Error("Tipster não encontrado.")

  if (tipster.planTier === "STARTER") {
    throw new RecursoNaoDisponivelNoPlanoError(tipster.planTier)
  }
}
