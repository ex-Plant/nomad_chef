import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload, type TypedLocale } from "payload";
import config from "@/payload.config";

export type LocaleT = "pl" | "en";

export type HeadingLineT = { text: string; className?: string };
export type CtaT = { label: string; href: string };
export type ContactChannelT = { label: string; value: string; href: string };
export type MediaT = {
  url: string;
  mimeType: string;
  alt: string;
  width?: number;
  height?: number;
};

export type SiteT = {
  hero: {
    tagline: string;
    headingLines: HeadingLineT[];
    lead: string;
    ctas: CtaT[];
    mediaDesktop?: MediaT;
    mediaMobile?: MediaT;
  };
  about: {
    eyebrow: string;
    imageAlt: string;
    image?: MediaT;
    headingLines: HeadingLineT[];
    intro: string;
    quote: string;
    paragraphs: string[];
  };
  services: {
    eyebrow: string;
    backgroundAlt: string;
    background?: MediaT;
    slides: { title: string; tagline: string; description: string }[];
  };
  campFood: {
    eyebrow: string;
    kicker: string;
    headingLines: HeadingLineT[];
    cta: CtaT;
    slides: { alt: string; description: string; image?: MediaT }[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    handle: string;
    images: MediaT[];
  };
  contact: {
    eyebrow: string;
    headingLines: HeadingLineT[];
    lead: string;
    description: string;
    email: ContactChannelT;
    instagram: ContactChannelT;
    formPlaceholder: string;
    submit: CtaT;
    footer: string;
  };
  nav: { id: string; label: string }[];
  siteTitle: string;
  siteDescription: string;
};

const colorToClass = (color: string | null | undefined): string | undefined => {
  if (!color || color === "off-black") return "text-off-black";
  return `text-${color}`;
};

type RawHeadingLine = { text?: string | null; color?: string | null };
const toLines = (arr: RawHeadingLine[] | null | undefined): HeadingLineT[] =>
  (arr ?? []).map((l) => ({
    text: l.text ?? "",
    className: colorToClass(l.color),
  }));

type RawCta = { label?: string | null; href?: string | null };
const toCta = (g: RawCta | null | undefined): CtaT => ({
  label: g?.label ?? "",
  href: g?.href ?? "#",
});

type RawChannel = {
  label?: string | null;
  value?: string | null;
  href?: string | null;
};
const toChannel = (g: RawChannel | null | undefined): ContactChannelT => ({
  label: g?.label ?? "",
  value: g?.value ?? "",
  href: g?.href ?? "#",
});

type RawMedia = {
  url?: string | null;
  mimeType?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};
const toMedia = (m: number | RawMedia | null | undefined): MediaT | undefined => {
  if (!m || typeof m === "number" || !m.url) return undefined;
  return {
    url: m.url,
    mimeType: m.mimeType ?? "",
    alt: m.alt ?? "",
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  };
};

const fetchSite = (locale: LocaleT) =>
  unstable_cache(
    async (): Promise<SiteT> => {
      const payload = await getPayload({ config });
      const raw = await payload.findGlobal({
        slug: "site",
        locale: locale as TypedLocale,
        depth: 1,
      });

      return {
        hero: {
          tagline: raw.hero_tagline ?? "",
          headingLines: (raw.hero_heading_lines ?? []).map((l) => ({
            text: l.text ?? "",
          })),
          lead: raw.hero_lead ?? "",
          ctas: (raw.hero_ctas ?? []).map((c) => toCta(c)),
          mediaDesktop: toMedia(raw.hero_media_desktop),
          mediaMobile: toMedia(raw.hero_media_mobile),
        },
        about: {
          eyebrow: raw.about_eyebrow ?? "",
          imageAlt: raw.about_image_alt ?? "",
          image: toMedia(raw.about_image),
          headingLines: toLines(raw.about_heading_lines),
          intro: raw.about_intro ?? "",
          quote: raw.about_quote ?? "",
          paragraphs: (raw.about_paragraphs ?? [])
            .map((p) => p.text ?? "")
            .filter(Boolean),
        },
        services: {
          eyebrow: raw.services_eyebrow ?? "",
          backgroundAlt: raw.services_background_alt ?? "",
          background: toMedia(raw.services_background),
          slides: (raw.services_slides ?? []).map((s) => ({
            title: s.title ?? "",
            tagline: s.tagline ?? "",
            description: s.description ?? "",
          })),
        },
        campFood: {
          eyebrow: raw.camp_food_eyebrow ?? "",
          kicker: raw.camp_food_kicker ?? "",
          headingLines: (raw.camp_food_heading_lines ?? []).map((l) => ({
            text: l.text ?? "",
          })),
          cta: toCta(raw.camp_food_cta),
          slides: (raw.camp_food_slides ?? []).map((s) => ({
            alt: s.alt ?? "",
            description: s.description ?? "",
            image: toMedia(s.image),
          })),
        },
        gallery: {
          eyebrow: raw.gallery_eyebrow ?? "",
          heading: raw.gallery_heading ?? "",
          handle: raw.gallery_handle ?? "",
          images: (raw.gallery_images ?? [])
            .map((g) => toMedia(g.image))
            .filter((m): m is MediaT => Boolean(m)),
        },
        contact: {
          eyebrow: raw.contact_eyebrow ?? "",
          headingLines: toLines(raw.contact_heading_lines),
          lead: raw.contact_lead ?? "",
          description: raw.contact_description ?? "",
          email: toChannel(raw.contact_email),
          instagram: toChannel(raw.contact_instagram),
          formPlaceholder: raw.contact_form_placeholder ?? "",
          submit: toCta(raw.contact_submit),
          footer: raw.contact_footer ?? "",
        },
        nav: (raw.nav_items ?? []).map((n) => ({
          id: n.section_id ?? "",
          label: n.label ?? "",
        })),
        siteTitle: raw.site_title ?? "",
        siteDescription: raw.site_description ?? "",
      };
    },
    ["site", locale],
    { tags: [`site:${locale}`] },
  );

export const getSite = cache(
  (locale: LocaleT = "pl"): Promise<SiteT> => fetchSite(locale)(),
);
