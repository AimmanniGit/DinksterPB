/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dinkster/shared', '@dinkster/database'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
