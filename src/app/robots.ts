import type { MetadataRoute } from "next";
import { ENV } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
        // disallow: "/",
      },
    ],
    sitemap: `${ENV.SITE_URL}/sitemap.xml`,
    host: ENV.SITE_URL,
  };
}
