/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://backend:8000/uploads/:path*',
      },
    ]
  },
}

export default nextConfig;