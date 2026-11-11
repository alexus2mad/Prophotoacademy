import type { NextConfig } from 'next';
const config: NextConfig = {
  // Preserve Next's default crawler set, adding Telegram and Viber so previews
  // receive metadata in <head> without running JavaScript or consuming streams.
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|Telegram|Viber/i,
  experimental: { agentUpgrade: 'security' },
  serverExternalPackages: ['node:sqlite'],
  outputFileTracingExcludes: { '/*': ['./.data/**/*', './content/source/**/*', './scripts/**/*'] },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }] },
  async redirects() {
    return [
      { source: '/page-in-progress', destination: '/courses', permanent: true },
      { source: '/401', destination: '/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/hero/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/social/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default config;
