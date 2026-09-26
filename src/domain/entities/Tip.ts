export type TipResult = 'green' | 'red' | 'void' | 'pending'

export class Tip {
  constructor(
    public readonly id: string,
    public readonly channelId: string,
    public readonly sport: string,
    public readonly event: string,
    public readonly market: string,
    public readonly odds: number,
    public readonly units: number,
    public readonly result: TipResult,
    public readonly date: string,
    public readonly potentialReturn: number | null,
    public readonly bookmaker: string | null,
    public readonly notes: string | null,
  ) {}
}
