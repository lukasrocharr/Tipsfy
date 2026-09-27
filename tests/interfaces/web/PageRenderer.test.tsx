import { describe, expect, it } from 'vitest'
import { applyPageAppearance, type RenderablePageBlock } from '../../../src/interfaces/web/components/PageRenderer'

describe('PageRenderer public appearance', () => {
  it('renders public blocks with the dark system tokens regardless of saved light colors', () => {
    const blocks: RenderablePageBlock[] = [{
      id: 'bio-1',
      type: 'BIO',
      content: { text: 'Performance e análises' },
      style: {
        backgroundColor: '#FFFFFF',
        textColor: '#020617',
        fontFamily: 'Inter',
        alignment: 'left',
        padding: 32,
      },
    }]

    const darkBlocks = applyPageAppearance(blocks, 'dark')

    expect(darkBlocks[0].style).toMatchObject({
      backgroundColor: 'var(--tipsfy-black)',
      textColor: 'var(--tipsfy-white)',
      fontFamily: 'Montserrat',
    })
    expect(blocks[0].style.backgroundColor).toBe('#FFFFFF')
  })
})