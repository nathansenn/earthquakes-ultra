import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force clean build - Jan 29 2026 14:45
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Output standalone for Docker
  output: 'standalone',
};

export default nextConfig;
