export declare const RESERVED_PUBLIC_CHANNEL_SLUGS: ReadonlySet<string>

export declare function isReservedPublicChannelSlug(slug: string): boolean

export declare function normalizePublicChannelSlug(name: string): string

export declare function generateUniquePublicChannelSlug(
  name: string,
  isTaken: (slug: string) => boolean | Promise<boolean>,
): Promise<string>