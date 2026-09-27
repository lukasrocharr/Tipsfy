import { Globe, Link2, Send } from "lucide-react"
import type { BlockOfType } from "./types"
import { blockStyleToCss } from "./blockStyle"

function iconForPlatform(platform: string) {
  const normalized = platform.toLowerCase()
  if (normalized.includes("telegram")) return Send
  if (normalized.includes("site") || normalized.includes("web")) return Globe
  return Link2
}

export default function SocialLinksBlock({
  block,
}: {
  block: BlockOfType<"SOCIAL_LINKS">
}) {
  return (
    <nav
      className="w-full min-w-0"
      style={blockStyleToCss(block.style)}
      aria-label="Redes sociais"
    >
      <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3">
        {block.content.links.map(({ platform, url }, index) => {
          const Icon = iconForPlatform(platform)
          return (
            <li key={`${platform}-${index}`} className="min-w-0 max-w-full">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-current/20 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Icon aria-hidden="true" size={18} className="shrink-0" />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {platform}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
