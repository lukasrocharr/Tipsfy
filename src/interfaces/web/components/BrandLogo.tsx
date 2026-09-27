type BrandLogoProps = {
  className?: string
}

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 1200 400"
      className={className}
      role="img"
      aria-label="Tipsfy"
    >
      <use href="/brand/logo-horizontal.svg#tipsfy-logo" />
    </svg>
  )
}