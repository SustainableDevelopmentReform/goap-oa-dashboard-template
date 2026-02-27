import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/": ["./public/data/**/*"],
  },
};

export default nextConfig;
