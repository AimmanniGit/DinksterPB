/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dinkster/shared', '@dinkster/database'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Disabling Webpack file-system cache in dev mode prevents OneDrive file-locking ENOENT errors
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
