/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', "randomuser.me"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me/api',
        pathname: '**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1/:path*',
        // destination: 'http://localhost:5000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig; 