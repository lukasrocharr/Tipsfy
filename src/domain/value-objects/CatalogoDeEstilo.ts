import { EstiloInvalidoError } from "../errors/EstiloInvalidoError"

// As opções curadas permitem customização sem produzir combinações ilegíveis.
export const PALETAS_CURADAS = {
  "creator-economy-pink": {
    primary: "#EC4899",
    onPrimary: "#000000",
    secondary: "#F472B6",
    onSecondary: "#0F172A",
    accent: "#EA580C",
    onAccent: "#000000",
    background: "#FDF2F8",
    foreground: "#831843",
  },
  "sports-fitness": {
    primary: "#0F172A",
    onPrimary: "#FFFFFF",
    secondary: "#334155",
    onSecondary: "#FFFFFF",
    accent: "#0369A1",
    onAccent: "#FFFFFF",
    background: "#F8FAFC",
    foreground: "#020617",
  },
  "high-contrast-blue": {
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    secondary: "#0891B2",
    onSecondary: "#000000",
    accent: "#EA580C",
    onAccent: "#000000",
    background: "#F8FAFC",
    foreground: "#0F172A",
  },
  "b2b-professional": {
    primary: "#0F172A",
    onPrimary: "#FFFFFF",
    secondary: "#334155",
    onSecondary: "#FFFFFF",
    accent: "#0369A1",
    onAccent: "#FFFFFF",
    background: "#F8FAFC",
    foreground: "#020617",
  },
  "sports-team-club": {
    primary: "#DC2626",
    onPrimary: "#FFFFFF",
    secondary: "#EF4444",
    onSecondary: "#000000",
    accent: "#DC2626",
    onAccent: "#FFFFFF",
    background: "#FEF2F2",
    foreground: "#7F1D1D",
  },
  "analytics-dashboard": {
    primary: "#1E40AF",
    onPrimary: "#FFFFFF",
    secondary: "#3B82F6",
    onSecondary: "#000000",
    accent: "#D97706",
    onAccent: "#000000",
    background: "#F8FAFC",
    foreground: "#1E3A8A",
  },
  "link-in-bio-blue": {
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    secondary: "#7C3AED",
    onSecondary: "#FFFFFF",
    accent: "#EC4899",
    onAccent: "#000000",
    background: "#FFFFFF",
    foreground: "#0F172A",
  },
} as const

export const PAREAMENTOS_DE_FONTES = {
  "sports-fitness": { heading: "Barlow Condensed", body: "Barlow" },
  "bold-statement": { heading: "Bebas Neue", body: "Source Sans 3" },
  "editorial-poster": {
    heading: "Inter",
    body: "Playfair Display",
    accent: "JetBrains Mono",
  },
  "modern-professional": { heading: "Poppins", body: "Open Sans" },
  "bauhaus-geometric": { heading: "Outfit", body: "Outfit" },
} as const

export const FONT_FAMILIES_CURADAS = [
  "Barlow Condensed",
  "Barlow",
  "Bebas Neue",
  "Source Sans 3",
  "Inter",
  "Playfair Display",
  "JetBrains Mono",
  "Poppins",
  "Open Sans",
  "Outfit",
] as const

export type PrimaryColorId = keyof typeof PALETAS_CURADAS
export type FontPairingId = keyof typeof PAREAMENTOS_DE_FONTES
export type FontFamilyId = typeof FONT_FAMILIES_CURADAS[number]

export function validarPrimaryColorId(
  id: string,
): asserts id is PrimaryColorId {
  if (!Object.prototype.hasOwnProperty.call(PALETAS_CURADAS, id)) {
    throw new EstiloInvalidoError("primaryColorId", id)
  }
}

export function validarFontPairingId(id: string): asserts id is FontPairingId {
  if (!Object.prototype.hasOwnProperty.call(PAREAMENTOS_DE_FONTES, id)) {
    throw new EstiloInvalidoError("fontPairingId", id)
  }
}

export function validarFontFamily(id: string): asserts id is FontFamilyId {
  if (!(FONT_FAMILIES_CURADAS as readonly string[]).includes(id)) {
    throw new EstiloInvalidoError("fontFamily", id)
  }
}
