import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent Next.js from redirecting /api/.../ → /api/... before the proxy
  // rewrite runs (avoids Django APPEND_SLASH redirect going to port 8000 directly).
  skipTrailingSlashRedirect: true,
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ]
    },
  }),
}

export default nextConfig
