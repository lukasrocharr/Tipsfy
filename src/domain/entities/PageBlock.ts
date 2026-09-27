import type { FontFamilyId } from '../value-objects/CatalogoDeEstilo'

export type PageBlockType =
  | 'HERO'
  | 'BIO'
  | 'STATS'
  | 'PLANS'
  | 'SOCIAL_LINKS'
  | 'CUSTOM_TEXT'
  | 'IMAGE'
  | 'DIVIDER'

export type PageBlockStyle = {
  backgroundColor: string
  textColor: string
  fontFamily: FontFamilyId
  alignment: 'left' | 'center' | 'right'
  padding: number
}

type PageBlockBase<TType extends PageBlockType, TContent> = {
  /** UUID that identifies this block. */
  id: string
  type: TType
  content: TContent
  style: PageBlockStyle
}

type EmptyContent = Record<string, never>

export type SocialLink = {
  platform: string
  url: string
}

export type PageBlock =
  | PageBlockBase<'HERO', { bannerUrl: string; avatarUrl: string; title: string; subtitle: string }>
  | PageBlockBase<'BIO', { text: string }>
  // STATS não guarda números: vêm ao vivo do banco ao servir a página e nunca são congelados no documento; aqui ficam posição e estilo.
  | PageBlockBase<'STATS', EmptyContent>
  // PLANS não guarda a lista: ela vem ao vivo do banco ao servir a página e nunca é congelada no documento; aqui ficam posição e estilo.
  | PageBlockBase<'PLANS', EmptyContent>
  | PageBlockBase<'SOCIAL_LINKS', { links: SocialLink[] }>
  | PageBlockBase<'CUSTOM_TEXT', { title: string; paragraph: string }>
  | PageBlockBase<'IMAGE', { url: string; caption?: string }>
  | PageBlockBase<'DIVIDER', EmptyContent>