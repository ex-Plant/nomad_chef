import "server-only";
import type { MetadataRoute } from "next";
import { getSite } from "@/lib/get-site";
import { getLegalPage } from "@/lib/get-legal-page";
import { LEGAL_SLUGS } from "@/config/legal";
import { ENV } from "@/config/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, terms, privacy] = await Promise.all([
    getSite(),
    getLegalPage(LEGAL_SLUGS.terms),
    getLegalPage(LEGAL_SLUGS.privacy),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${ENV.SITE_URL}/`, lastModified: new Date(site.updatedAt) },
  ];

  if (terms) {
    entries.push({
      url: `${ENV.SITE_URL}/${LEGAL_SLUGS.terms}`,
      lastModified: new Date(terms.updatedAt),
    });
  }

  if (privacy) {
    entries.push({
      url: `${ENV.SITE_URL}/${LEGAL_SLUGS.privacy}`,
      lastModified: new Date(privacy.updatedAt),
    });
  }

  return entries;
}
