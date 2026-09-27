import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

export default function HeroBlock({ block, tipsterAvatarUrl }: { block: BlockOfType<"HERO">; tipsterAvatarUrl?: string | null }) {
  const { title, subtitle, bannerUrl, avatarUrl } = block.content
  const hasBanner =
    bannerUrl.trim().length > 0 &&
    !bannerUrl.toLowerCase().includes("placeholder")
  const hasAvatar =
    avatarUrl.trim().length > 0 &&
    !avatarUrl.toLowerCase().includes("placeholder")
  const publicAvatarUrl = hasAvatar ? avatarUrl : tipsterAvatarUrl
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <section
      className="relative isolate flex min-h-60 w-full min-w-0 items-center overflow-hidden @sm:min-h-72 @md:min-h-80"
      style={blockStyleToCss(block.style)}
    >
      {hasBanner && (
        <>
          <img
            src={bannerUrl}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-black/45"
          />
        </>
      )}
      <div
        className={`relative mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 @sm:flex-row @sm:items-center ${
          block.style.alignment === "center"
            ? "@sm:justify-center"
            : "@sm:justify-between"
        }`}
      >
        <div
          className={`min-w-0 flex-1 ${
            block.style.alignment === "center" ? "@sm:text-center" : ""
          }`}
        >
          <h1 className="break-words text-3xl font-bold leading-tight @sm:text-4xl @md:text-5xl [overflow-wrap:anywhere]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed opacity-90 [overflow-wrap:anywhere]">
              {subtitle}
            </p>
          )}
        </div>
        {publicAvatarUrl ? (
          <img
            src={publicAvatarUrl}
            alt={title}
            loading="eager"
            className="h-20 w-20 shrink-0 rounded-full border-2 border-white/70 object-cover @sm:h-24 @sm:w-24"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-current/40 bg-black/10 text-2xl font-semibold @sm:h-24 @sm:w-24"
          >
            {initials || "T"}
          </div>
        )}
      </div>
    </section>
  )
}
