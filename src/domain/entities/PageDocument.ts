import type { PageBlock } from './PageBlock'
import {
  validarFontFamily,
  validarFontPairingId,
  validarPrimaryColorId,
  type FontPairingId,
  type PrimaryColorId,
} from '../value-objects/CatalogoDeEstilo'

export const MAX_PAGE_BLOCKS = 20
export const MAX_FREE_TEXT_CHARACTERS = 2000

export type GlobalTheme = {
  primaryColorId: PrimaryColorId
  fontPairingId: FontPairingId
}

export type PageDocumentProps = {
  channelId: string
  templateId: string
  /** Array order defines the visual order of the blocks. */
  blocks: PageBlock[]
  globalTheme: GlobalTheme
  updatedAt: Date
}

export class PageDocument {
  public readonly channelId: string
  public readonly templateId: string
  public readonly blocks: PageBlock[]
  public readonly globalTheme: GlobalTheme
  public readonly updatedAt: Date

  constructor(props: PageDocumentProps) {
    if (props.blocks.length > MAX_PAGE_BLOCKS) {
      // Limita abuso e páginas absurdamente longas; não é uma restrição arbitrária de produto.
      throw new RangeError(`Uma página pode ter no máximo ${MAX_PAGE_BLOCKS} blocos.`)
    }

    validarPrimaryColorId(props.globalTheme.primaryColorId)
    validarFontPairingId(props.globalTheme.fontPairingId)

    for (const block of props.blocks) {
      validarFontFamily(block.style.fontFamily)
      this.validarTextoLivre(block)
    }

    this.channelId = props.channelId
    this.templateId = props.templateId
    this.blocks = [...props.blocks]
    this.globalTheme = { ...props.globalTheme }
    this.updatedAt = new Date(props.updatedAt)
  }

  private validarTextoLivre(block: PageBlock): void {
    const text = block.type === 'BIO'
      ? block.content.text
      : block.type === 'CUSTOM_TEXT'
        ? block.content.paragraph
        : undefined

    if (text !== undefined && [...text].length > MAX_FREE_TEXT_CHARACTERS) {
      throw new RangeError(`O texto livre do bloco pode ter no máximo ${MAX_FREE_TEXT_CHARACTERS} caracteres.`)
    }
  }
}