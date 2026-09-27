import {
  PALETAS_CURADAS,
  PAREAMENTOS_DE_FONTES,
  type FontPairingId,
  type PrimaryColorId,
} from "../../../../domain/value-objects/CatalogoDeEstilo"
import type { GlobalTheme } from "../../../../domain/entities/PageDocument"
import type {
  PageBlock,
  PageBlockStyle,
  PageBlockType,
} from "../../../../domain/entities/PageBlock"

export const DEFAULT_PAGE_THEME: GlobalTheme = {
  primaryColorId: "b2b-professional",
  fontPairingId: "modern-professional",
}

export function createBlockStyle(
  theme: GlobalTheme,
  type: PageBlockType,
): PageBlockStyle {
  const palette = PALETAS_CURADAS[theme.primaryColorId]
  const pairing = PAREAMENTOS_DE_FONTES[theme.fontPairingId]
  const useHeadingFont = type === "HERO" || type === "CUSTOM_TEXT"

  return {
    backgroundColor: palette.background,
    textColor: palette.foreground,
    fontFamily: useHeadingFont ? pairing.heading : pairing.body,
    alignment: "left",
    padding: 16,
  }
}

export function createPageBlock(
  type: PageBlockType,
  theme: GlobalTheme,
): PageBlock {
  const id = crypto.randomUUID()
  const style = createBlockStyle(theme, type)

  switch (type) {
    case "HERO":
      return {
        id,
        type,
        style,
        content: {
          bannerUrl: "",
          avatarUrl: "",
          title: "Novo destaque",
          subtitle: "",
        },
      }
    case "BIO":
      return { id, type, style, content: { text: "" } }
    case "STATS":
    case "PLANS":
    case "DIVIDER":
      return { id, type, style, content: {} }
    case "SOCIAL_LINKS":
      return { id, type, style, content: { links: [] } }
    case "CUSTOM_TEXT":
      return {
        id,
        type,
        style,
        content: { title: "Novo texto", paragraph: "" },
      }
    case "IMAGE":
      return { id, type, style, content: { url: "", caption: "" } }
  }
}

export function updatePrimaryColor(
  theme: GlobalTheme,
  primaryColorId: PrimaryColorId,
): GlobalTheme {
  return { ...theme, primaryColorId }
}

export function updateFontPairing(
  theme: GlobalTheme,
  fontPairingId: FontPairingId,
): GlobalTheme {
  return { ...theme, fontPairingId }
}
