import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    qualities: [90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2880, 3840],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    localPatterns: [
      { pathname: "/api/media/file/**" },
      { pathname: "/videos/**", search: "" },
      { pathname: "/_next/static/**", search: "" },
    ],
  },
  allowedDevOrigins: ["192.168.31.177", "192.168.31.183"],
};

export default withPayload(nextConfig);
