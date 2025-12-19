import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure external packages for server components
  serverExternalPackages: ["@prisma/client"],
  // Empty turbopack config to silence warnings when using webpack
  turbopack: {},
  // Webpack configuration to handle Prisma properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
