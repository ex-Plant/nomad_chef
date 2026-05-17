import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

export type MediaT = {
  url: string;
  mimeType: string;
  alt: string;
  width?: number;
  height?: number;
};

export type LegalLinkT = { href: string; label: string };

export type CampFoodThemeT = "orange" | "blue";
export type CampFoodOrientationT = "vertical" | "horizontal";

export type HeadingLineT = { text: string; className?: string };
export type CtaT = { label: string; href: string };
export type ContactChannelT = { label: string; value: string; href: string };

export type SiteT = {
  hero: {
    tagline: string;
    headingLines: HeadingLineT[];
    lead: string;
    ctas: CtaT[];
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
    slides: {
      alt: string;
      description: string;
      image?: MediaT;
      theme: CampFoodThemeT;
      imageOrientation: CampFoodOrientationT;
    }[];
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
    legal: SerializedEditorState | null;
    newsletter: {
      title: string;
      description: string;
    };
  };
  nav: { id: string; label: string }[];
  siteTitle: string;
  siteDescription: string;
  legalLinks: { terms: LegalLinkT | null; privacy: LegalLinkT | null };
  updatedAt: string;
};
