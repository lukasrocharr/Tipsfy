export declare function normalizePublicChannelSlug(name: string): string

export declare function generateUniquePublicChannelSlug(
  name: string,
  isTaken: (slug: string) => boolean | Promise<boolean>,
): Promise<string>