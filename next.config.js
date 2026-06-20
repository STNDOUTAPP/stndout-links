/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // L'AASA (Universal Links iOS) DOIT être servi en application/json, sans extension.
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
};
module.exports = nextConfig;
