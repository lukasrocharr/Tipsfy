import { describe, expect, it } from 'vitest'
import { escolherMelhoresOdds } from '../../src/domain/services/MelhorOdd'

describe('escolherMelhoresOdds', () => {
  it('escolhe a melhor odd entre vários bookmakers e resolve empates deterministically', () => {
    const evento = {
      id: 'evt-1',
      sportKey: 'soccer_brazil_campeonato',
      homeTeam: 'Flamengo',
      awayTeam: 'Palmeiras',
      commenceTime: '2026-09-26T20:00:00Z',
      bookmakers: [
        {
          key: 'bet365',
          title: 'Bet365',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Flamengo', price: 2.2 }, { name: 'Palmeiras', price: 3.1 }] }],
        },
        {
          key: 'betano',
          title: 'Betano',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Flamengo', price: 2.4 }, { name: 'Palmeiras', price: 2.9 }] }],
        },
        {
          key: 'sportingbet',
          title: 'Sportingbet',
          markets: [{ key: 'h2h', outcomes: [{ name: 'Flamengo', price: 2.4 }, { name: 'Palmeiras', price: 2.9 }] }],
        },
      ],
    }

    expect(escolherMelhoresOdds(evento)).toEqual({
      eventId: 'evt-1',
      homeTeam: 'Flamengo',
      awayTeam: 'Palmeiras',
      commenceTime: '2026-09-26T20:00:00Z',
      selection: 'Flamengo',
      price: 2.4,
      bookmaker: 'Betano',
      market: 'h2h',
      sportKey: 'soccer_brazil_campeonato',
    })
  })
})
