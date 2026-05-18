import type { MetadataRoute } from "next";
import { ENV } from "@/config/env";

// One-pager: only the homepage is worth indexing. Legal pages are linked from
// the footer and have no SEO value. If real routes are ever added, list them here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${ENV.SITE_URL}/`, lastModified: new Date() }];
}
