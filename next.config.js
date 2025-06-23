/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      // Common food blog and recipe sites
      {
        protocol: 'https',
        hostname: 'sugarspunrun.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sugarspunrun.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sallysbakingaddiction.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sallysbakingaddiction.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'joyfoodsunshine.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.joyfoodsunshine.com',
        port: '',
        pathname: '/**',
      },
      // Allow most external domains
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/server/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 