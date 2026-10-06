import type {NextConfig} from 'next';
const config: NextConfig = {
  serverExternalPackages: ['node:sqlite'],
  outputFileTracingExcludes: {'/*':['./.data/**/*','./content/source/**/*','./scripts/**/*']},
  images: {remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}]},
  async redirects() {
    return [
      {source: '/page-in-progress', destination: '/courses', permanent: true},
      {source: '/401', destination: '/', permanent: true},
    ];
  },
  async headers() {
    return [{source: '/:path*', headers: [
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
    ]}];
  },
};
export default config;
