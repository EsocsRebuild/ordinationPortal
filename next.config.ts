import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['lucide-react'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache in development to prevent Docker volume stat/ENOENT sync collisions
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
