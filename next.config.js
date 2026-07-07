/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1'],
  
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
}

module.exports = nextConfig
