export type OddsSelectionEvent = {
  id: string
  sportKey: string
  homeTeam: string
  awayTeam: string
  commenceTime?: string
  bookmakers?: Array<{
    key: string
    title: string
    markets?: Array<{
      key: string
      outcomes?: Array<{
        name: string
        price: number
      }>
    }>
  }>
}

export type MelhorOdd = {
  eventId: string
  sportKey: string
  commenceTime?: string
  homeTeam: string
  awayTeam: string
  selection: string
  price: number
  bookmaker: string
  market: string
}

export function escolherMelhoresOdds(evento: OddsSelectionEvent): MelhorOdd | null {
  const bookmakers = evento.bookmakers ?? []
  let best: { selection: string; price: number; bookmaker: string; market: string } | null = null

  for (const bookmaker of bookmakers) {
    const markets = bookmaker.markets ?? []

    for (const market of markets) {
      const outcomes = market.outcomes ?? []

      for (const outcome of outcomes) {
        const isHomeSelection = outcome.name === evento.homeTeam
        if (!isHomeSelection) continue

        const candidate = {
          selection: outcome.name,
          price: Number(outcome.price),
          bookmaker: bookmaker.title,
          market: market.key,
        }

        if (!Number.isFinite(candidate.price) || candidate.price <= 0) continue

        if (!best || candidate.price > best.price || (candidate.price === best.price && candidate.bookmaker.localeCompare(best.bookmaker) < 0)) {
          best = candidate
        }
      }
    }
  }

  if (!best) {
    for (const bookmaker of bookmakers) {
      const markets = bookmaker.markets ?? []

      for (const market of markets) {
        const outcomes = market.outcomes ?? []

        for (const outcome of outcomes) {
          const candidate = {
            selection: outcome.name,
            price: Number(outcome.price),
            bookmaker: bookmaker.title,
            market: market.key,
          }

          if (!Number.isFinite(candidate.price) || candidate.price <= 0) continue

          if (!best || candidate.price > best.price || (candidate.price === best.price && candidate.bookmaker.localeCompare(best.bookmaker) < 0)) {
            best = candidate
          }
        }
      }
    }
  }

  if (!best) return null

  return {
    eventId: evento.id,
    sportKey: evento.sportKey,
    commenceTime: evento.commenceTime,
    homeTeam: evento.homeTeam,
    awayTeam: evento.awayTeam,
    selection: best.selection,
    price: best.price,
    bookmaker: best.bookmaker,
    market: best.market,
  }
}
