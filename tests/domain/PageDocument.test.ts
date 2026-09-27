import { describe, expect, it } from 'vitest'
import { PageDocument, MAX_FREE_TEXT_CHARACTERS, MAX_PAGE_BLOCKS } from '../../src/domain/entities/PageDocument'
import type { PageDocumentProps } from '../../src/domain/entities/PageDocument'
import type { PageBlock, PageBlockStyle } from '../../src/domain/entities/PageBlock'
import { EstiloInvalidoError } from '../../src/domain/errors/EstiloInvalidoError'

const style: PageBlockStyle = {
  backgroundColor: '#FFFFFF',
  textColor: '#111111',
  fontFamily: 'Barlow',
  alignment: 'left',
  padding: 16,
}

const baseDocument = (): PageDocumentProps => ({
  channelId: 'channel-1',
  templateId: 'creator-profile',
  blocks: [] as PageBlock[],
  globalTheme: { primaryColorId: 'sports-fitness', fontPairingId: 'sports-fitness' },
  updatedAt: new Date('2026-09-26T00:00:00.000Z'),
})

const bioBlock = (text: string): PageBlock => ({
  id: 'block-1',
  type: 'BIO',
  content: { text },
  style,
})

describe('PageDocument', () => {
  it('rejeita documentos que excedem o limite de blocos', () => {
    const props = baseDocument()
    props.blocks = Array.from({ length: MAX_PAGE_BLOCKS + 1 }, (_, index) => ({
      id: `block-${index}`,
      type: 'DIVIDER' as const,
      content: {},
      style,
    }))

    expect(() => new PageDocument(props)).toThrow(RangeError)
  })

  it('rejeita texto livre acima do limite de caracteres', () => {
    const props = baseDocument()
    props.blocks = [bioBlock('a'.repeat(MAX_FREE_TEXT_CHARACTERS + 1))]

    expect(() => new PageDocument(props)).toThrow(RangeError)
  })

  it('rejeita uma cor primária que não pertence ao catálogo', () => {
    const props = baseDocument()
    props.globalTheme.primaryColorId = 'unknown-palette' as PageDocumentProps['globalTheme']['primaryColorId']

    expect(() => new PageDocument(props)).toThrow(EstiloInvalidoError)
  })

  it('rejeita uma família tipográfica que não pertence ao catálogo', () => {
    const props = baseDocument()
    const block = bioBlock('Sobre o tipster')
    props.blocks = [{
      ...block,
      style: { ...style, fontFamily: 'Unknown Font' as PageBlockStyle['fontFamily'] },
    }]

    expect(() => new PageDocument(props)).toThrow(EstiloInvalidoError)
  })
})