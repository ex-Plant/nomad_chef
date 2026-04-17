import { getPayload } from "payload";
import config from "../payload.config.js";
import { CONTENT, NAV_ITEMS } from "../config/content.js";

type ColorT = "off-black" | "coral" | "blue" | "white" | "pink" | "yellow";

const classToColor = (className: string | undefined): ColorT => {
  if (!className) return "off-black";
  if (className.includes("coral")) return "coral";
  if (className.includes("blue")) return "blue";
  if (className.includes("pink")) return "pink";
  if (className.includes("yellow")) return "yellow";
  if (className.includes("white")) return "white";
  return "off-black";
};

const payload = await getPayload({ config });

await payload.updateGlobal({
  slug: "site",
  locale: "pl",
  data: {
    hero_tagline: CONTENT.hero.tagline,
    hero_heading_lines: CONTENT.hero.headingLines.map((l) => ({ text: l.text })),
    hero_lead: CONTENT.hero.lead,
    hero_ctas: CONTENT.hero.ctas.map((c) => ({ label: c.label, href: c.href })),

    about_eyebrow: CONTENT.about.eyebrow,
    about_heading_lines: CONTENT.about.headingLines.map((l) => ({
      text: l.text,
      color: classToColor(l.className),
    })),
    about_intro: CONTENT.about.intro,
    about_quote: CONTENT.about.quote,
    about_paragraphs: CONTENT.about.paragraphs.map((text) => ({ text })),
    about_image_alt: CONTENT.about.imageAlt,

    services_eyebrow: CONTENT.services.eyebrow,
    services_background_alt: CONTENT.services.backgroundAlt,
    services_slides: CONTENT.services.slides.map((s) => ({
      title: s.title,
      tagline: s.tagline,
      description: s.description,
    })),

    camp_food_eyebrow: CONTENT.campFood.eyebrow,
    camp_food_kicker: CONTENT.campFood.kicker,
    camp_food_heading_lines: CONTENT.campFood.headingLines.map((l) => ({
      text: l.text,
    })),
    camp_food_cta: {
      label: CONTENT.campFood.cta.label,
      href: CONTENT.campFood.cta.href,
    },
    camp_food_slides: CONTENT.campFood.slides.map((s) => ({
      alt: s.alt,
      description: s.description,
    })),

    gallery_eyebrow: CONTENT.gallery.eyebrow,
    gallery_heading: CONTENT.gallery.heading,
    gallery_handle: CONTENT.gallery.handle,

    contact_eyebrow: CONTENT.contact.eyebrow,
    contact_heading_lines: CONTENT.contact.headingLines.map((l) => ({
      text: l.text,
      color: classToColor(l.className),
    })),
    contact_lead: CONTENT.contact.lead,
    contact_email: {
      label: CONTENT.contact.email.label,
      value: CONTENT.contact.email.value,
      href: CONTENT.contact.email.href,
    },
    contact_instagram: {
      label: CONTENT.contact.instagram.label,
      value: CONTENT.contact.instagram.value,
      href: CONTENT.contact.instagram.href,
    },
    contact_form_placeholder: CONTENT.contact.formPlaceholder,
    contact_submit: {
      label: CONTENT.contact.submit.label,
      href: CONTENT.contact.submit.href,
    },
    contact_footer: CONTENT.contact.footer,

    site_title: "Nomad Chef",
    site_description: CONTENT.hero.lead,
    nav_items: NAV_ITEMS.map((n) => ({ label: n.label, section_id: n.id })),
  },
});

payload.logger.info("Site content seeded (locale: pl)");
process.exit(0);
