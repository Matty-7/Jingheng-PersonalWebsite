import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      'jinghenghuan\\.com',
      'jingheng-huan\\.jh730493450\\.chatgpt\\.site',
    ].map((host) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: 'https://www.jinghenghuan.com/:path*',
      permanent: true,
    }));
  },
};

export default nextConfig;
