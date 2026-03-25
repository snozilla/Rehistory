import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Rehistory",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
