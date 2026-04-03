import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ensure Prisma native binaries are bundled correctly on Vercel
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
