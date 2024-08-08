const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  skipWaiting: true,
  reloadOnOnline: false,
})

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  // distDir: 'dist',
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts', 'scripts', 'app'], // Only run ESLint on these directories during production builds (next build)
  },
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      const originalEntry = config.entry
      config.entry = async () => {
        const wdrPath = path.resolve(__dirname, './src/wdyr.ts')
        const entries = await originalEntry()

        if (entries['main.js'] && !entries['main.js'].includes(wdrPath)) {
          entries['main.js'].push(wdrPath)
        }
        return entries
      }
    }
    return config
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
