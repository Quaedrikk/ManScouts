import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve under a sub-path (e.g. /manscouts on quadmds.com). Unset the env var
  // to serve at the domain root again.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
