import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: '/peptides', destination: '/atlas/peptides', permanent: true },
      { source: '/peptides/:slug', destination: '/atlas/peptides/:slug', permanent: true },
      { source: '/stacks', destination: '/atlas/stacks', permanent: true },
      { source: '/effects', destination: '/atlas/effects', permanent: true },
      { source: '/compare', destination: '/atlas/compare', permanent: true },
      { source: '/protocol-generator', destination: '/atlas/protocol-generator', permanent: true },
    ];
  },
};

export default nextConfig;
