import type { MetadataRoute } from "next";
import { ENV } from "@/config/env";
import { LEGAL_SLUGS } from "@/config/legal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          `/${LEGAL_SLUGS.terms}`,
          `/${LEGAL_SLUGS.privacy}`,
        ],
      },
    ],
    sitemap: `${ENV.SITE_URL}/sitemap.xml`,
    host: ENV.SITE_URL,
  };
}
