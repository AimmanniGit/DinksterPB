/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dinkster/shared', '@dinkster/database'],
};

module.exports = nextConfig;
