import { describe, expect, it } from "vitest"
import {
  IMAGE_EXTENSION_BY_TYPE,
  MAX_IMAGE_UPLOAD_BYTES,
  matchesImageSignature,
} from "../../src/domain/services/ImageUploadPolicy"

describe("ImageUploadPolicy", () => {
  it("accepts the JPEG, PNG and WebP signatures for their declared MIME types", () => {
    expect(
      matchesImageSignature("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff, 0x00])),
    ).toBe(true)
    expect(
      matchesImageSignature(
        "image/png",
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe(true)
    expect(
      matchesImageSignature(
        "image/webp",
        new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
      ),
    ).toBe(true)
  })

  it("rejects a mismatched signature and keeps the 5 MiB limit", () => {
    expect(matchesImageSignature("image/png", new Uint8Array([0xff, 0xd8, 0xff]))).toBe(false)
    expect(MAX_IMAGE_UPLOAD_BYTES).toBe(5 * 1024 * 1024)
    expect(IMAGE_EXTENSION_BY_TYPE["image/jpeg"]).toBe("jpg")
  })
})