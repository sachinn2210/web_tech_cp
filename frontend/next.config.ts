import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname, // forces correct root
  },
};

module.exports = nextConfig;
export default nextConfig;
