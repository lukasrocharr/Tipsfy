import type { OddsEvent, OddsProvider } from '../../application/ports/OddsProvider'

export class TheOddsApiProvider implements OddsProvider {
  async buscarOddsPorEsporte(sportKey: string): Promise<OddsEvent[]> {
    const apiKey = process.env.THE_ODDS_API_KEY
    if (!sportKey) return []
    if (!apiKey) throw new Error('Configure THE_ODDS_API_KEY no .env para carregar odds ao vivo.')

    const response = await fetch(`https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sportKey)}/odds?regions=us&markets=h2h&apiKey=${encodeURIComponent(apiKey)}`)
    if (!response.ok) {
      throw new Error(`The Odds API falhou com status ${response.status}`)
    }

    const payload = await response.json() as Array<{
      id: string
      sport_key: string
      home_team: string
      away_team: string
      commence_time: string
      bookmakers?: Array<{
        key: string
        title: string
        markets?: Array<{
          key: string
          outcomes?: Array<{ name: string; price: number }>
        }>
      }>
    }>

    return payload.map(event => ({
      id: event.id,
      sportKey: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      bookmakers: (event.bookmakers ?? []).map(bookmaker => ({
        key: bookmaker.key,
        title: bookmaker.title,
        markets: (bookmaker.markets ?? []).map(market => ({
          key: market.key,
          outcomes: (market.outcomes ?? []).map(outcome => ({
            name: outcome.name,
            price: Number(outcome.price),
          })),
        })),
      })),
    }))
  }
}
