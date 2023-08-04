const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
})

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  distDir: '_static',
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts', 'scripts', 'app'], // Only run ESLint on these directories during production builds (next build)
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
