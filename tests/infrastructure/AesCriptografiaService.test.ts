import { describe, expect, it } from 'vitest'
import { AesCriptografiaService } from '../../src/infrastructure/crypto/AesCriptografiaService'

describe('AesCriptografiaService', () => {
  it('faz roundtrip do texto com AES-256-GCM', () => {
    const service = new AesCriptografiaService('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
    const original = '123456789:telegram-secret'
    const encrypted = service.criptografar(original)

    expect(encrypted).not.toContain(original)
    expect(service.descriptografar(encrypted)).toBe(original)
  })
})
