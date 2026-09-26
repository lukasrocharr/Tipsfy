/**
 * Value Object que valida o formato oficial de token de bot do Telegram.
 * A validação antecipada evita chamadas externas para entradas obviamente inválidas.
 */
import { TokenInvalidoError } from '../errors/TokenInvalidoError'

export class TokenDeBot {
  private constructor(public readonly value: string) {}

  static criar(value: string): TokenDeBot {
    const normalized = value.trim()
    if (!/^\d{8,12}:[A-Za-z0-9_-]{35}$/.test(normalized)) {
      throw new TokenInvalidoError()
    }
    return new TokenDeBot(normalized)
  }
}
