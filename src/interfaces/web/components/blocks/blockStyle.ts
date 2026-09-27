import type { CSSProperties } from "react"
import type { PageBlockStyle } from "./types"

export function blockStyleToCss(style: PageBlockStyle): CSSProperties {
  const fontFallback =
    style.fontFamily === "JetBrains Mono" ? "monospace" : "sans-serif"

  return {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    fontFamily: `"${style.fontFamily}", ${fontFallback}`,
    textAlign: style.alignment,
    padding: `${Math.max(0, style.padding) / 16}rem`,
  }
}
