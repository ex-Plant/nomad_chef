import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    qualities: [90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2880, 3840],
  },
};

export default withPayload(nextConfig);
