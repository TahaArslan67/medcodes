/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './src/components',
      '@/context': './src/context'
    }
    return config
  }
}

module.exports = nextConfig 