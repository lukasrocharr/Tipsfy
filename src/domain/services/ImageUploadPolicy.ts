export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number]
export type ImageAssetType = "hero-banner" | "hero-avatar" | "block-image" | "profile-avatar"

export const IMAGE_EXTENSION_BY_TYPE: Record<SupportedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export function matchesImageSignature(
  contentType: string,
  bytes: Uint8Array,
): boolean {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (contentType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    )
  }

  if (contentType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    )
  }

  return false
}