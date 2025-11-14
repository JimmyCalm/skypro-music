import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['webdev-music-003b5b991590.herokuapp.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
};

export default nextConfig;
