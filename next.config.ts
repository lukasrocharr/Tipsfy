import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/images/metodo-placeholder.jpg",
        destination: "/images/metodo-placeholder.svg",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
