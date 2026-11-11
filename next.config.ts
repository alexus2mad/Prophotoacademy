import type { NextConfig } from 'next';

// The deployed Next runtime includes this file and compiled routes, but no src directory.
const noindexHeader = { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' };
const noindexPath =
  '/:family(account|admin|api|checkout|demo|learn|login|operations|photo-studio|shop|studio|thanks)/:path*';

const config: NextConfig = {
  // Preserve Next's default crawler set. Messaging previews and answer engines
  // also receive metadata in <head> without running JavaScript or consuming streams.
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|Telegram|Viber|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User/i,
  experimental: { agentUpgrade: 'security' },
  serverExternalPackages: ['node:sqlite'],
  outputFileTracingExcludes: { '/*': ['./.data/**/*', './content/source/**/*', './scripts/**/*'] },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }] },
  async redirects() {
    return [{ source: '/401', destination: '/', permanent: true }];
  },
  async headers() {
    const indexingDisabled =
      process.env.SEO_INDEXABLE === 'false' || process.env.NEXT_PUBLIC_REVIEW_MODE === 'pages';
    return [
      { source: noindexPath, headers: [noindexHeader] },
      {
        source: '/:path*',
        // Next's Draft Mode uses this cookie. Mark previews even if a route redirects.
        has: [{ type: 'cookie' as const, key: '__prerender_bypass' }],
        headers: [noindexHeader],
      },
      ...(indexingDisabled ? [{ source: '/:path*', headers: [noindexHeader] }] : []),
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
