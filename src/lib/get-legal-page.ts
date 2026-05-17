import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload, type TypedLocale } from "payload";
import config from "@/payload.config";
import type { LegalPage } from "@/payload-types";
import type { LocaleT } from "@/types/locale";

const fetchLegalPage = (slug: string, locale: LocaleT) =>
  unstable_cache(
    async (): Promise<LegalPage | null> => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "legal-pages",
        where: { slug: { equals: slug } },
        locale: locale as TypedLocale,
        limit: 1,
        depth: 0,
      });
      return result.docs[0] ?? null;
    },
    ["legal-page", slug, locale],
    { tags: [`legal-page:${slug}`] },
  );

export const getLegalPage = cache(
  (slug: string, locale: LocaleT = "pl"): Promise<LegalPage | null> =>
    fetchLegalPage(slug, locale)(),
);
