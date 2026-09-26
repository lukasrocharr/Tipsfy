export type OddsMarketOutcome = {
  name: string
  price: number
}

export type OddsMarket = {
  key: string
  outcomes: OddsMarketOutcome[]
}

export type OddsBookmaker = {
  key: string
  title: string
  markets: OddsMarket[]
}

export type OddsEvent = {
  id: string
  sportKey: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
  bookmakers: OddsBookmaker[]
}

export interface OddsProvider {
  buscarOddsPorEsporte(sportKey: string): Promise<OddsEvent[]>
}
