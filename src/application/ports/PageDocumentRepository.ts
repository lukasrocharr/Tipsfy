import type { PageDocument } from "../../domain/entities/PageDocument"

export interface PageDocumentRepository {
  obterPorCanal(channelId: string): Promise<PageDocument | null>
  /** Persists a document by upserting on its unique channelId. */
  salvar(pageDocument: PageDocument): Promise<void>
}
