import { randomUUID } from 'node:crypto'

export const RESERVED_PUBLIC_CHANNEL_SLUGS = new Set([
  'termos',
  'privacidade',
  'precos',
  'sobre',
  'contato',
])

export function isReservedPublicChannelSlug(slug) {
  return RESERVED_PUBLIC_CHANNEL_SLUGS.has(slug)
}

export function normalizePublicChannelSlug(name) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `canal-${randomUUID().slice(0, 6)}`
}

export async function generateUniquePublicChannelSlug(name, isTaken) {
  const slugBase = normalizePublicChannelSlug(name)
  let slug = slugBase
  let suffix = 2

  while (isReservedPublicChannelSlug(slug) || await isTaken(slug)) {
    slug = `${slugBase}-${suffix}`
    suffix += 1
  }

  return slug
}