/**
 * Porta de criptografia para segredos persistidos, como tokens de bot.
 * A implementação concreta fica na infraestrutura para manter algoritmos fora da aplicação.
 */
export interface CriptografiaService {
  criptografar(value: string): string
  descriptografar(value: string): string
}
