// Stable code-side keys for legal pages, mapped to CMS slugs.
// Routes (`app/(site)/regulamin`, `polityka-prywatnosci`) and the seed
// script depend on these slugs — keep them in sync if you ever rename.
export const LEGAL_SLUGS = {
  terms: "regulamin",
  privacy: "polityka-prywatnosci",
} as const;
