import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'owcdn.net' },
      { protocol: 'https', hostname: 'www.vlr.gg' },
    ],
  },
};

export default nextConfig;
