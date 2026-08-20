import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Shakemap BMKG disajikan dari host ini (UI-SPEC Alat 1).
    remotePatterns: [{ protocol: 'https', hostname: 'data.bmkg.go.id', pathname: '/DataMKG/TEWS/**' }],
  },
}

export default nextConfig
