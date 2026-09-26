import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import type { CriptografiaService } from '../../application/ports/CriptografiaService'

const ALGORITMO = 'aes-256-gcm'
const TAMANHO_IV = 12
const TAMANHO_CHAVE = 32

export class AesCriptografiaService implements CriptografiaService {
  private readonly key: Buffer

  constructor(key = process.env.ENCRYPTION_KEY) {
    if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) throw new Error('ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.')
    this.key = Buffer.from(key, 'hex')
    if (this.key.length !== TAMANHO_CHAVE) throw new Error('ENCRYPTION_KEY inválida.')
  }

  criptografar(value: string): string {
    const iv = randomBytes(TAMANHO_IV)
    const cipher = createCipheriv(ALGORITMO, this.key, iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':')
  }

  descriptografar(value: string): string {
    const [ivHex, authTagHex, encryptedHex] = value.split(':')
    if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Texto cifrado inválido.')
    const decipher = createDecipheriv(ALGORITMO, this.key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8')
  }
}
