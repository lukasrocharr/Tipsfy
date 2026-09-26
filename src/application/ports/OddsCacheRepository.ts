export type OddsCacheEntry = {
  sportKey: string
  payload: unknown
  updatedAt: Date
}

export interface OddsCacheRepository {
  buscarPorSportKey(sportKey: string): Promise<OddsCacheEntry | null>
  salvar(sportKey: string, payload: unknown): Promise<void>
}
