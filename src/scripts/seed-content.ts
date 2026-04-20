import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
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

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const payload = await getPayload({ config });

/* Idempotent file uploader — dedupe by filename. */
const uploadedCache = new Map<string, number>();
async function uploadFile(relPath: string, alt: string): Promise<number> {
  const absPath = resolve(process.cwd(), relPath);
  const name = basename(absPath);

  if (uploadedCache.has(name)) return uploadedCache.get(name)!;

  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: name } },
    limit: 1,
  });
  if (existing.docs[0]) {
    const id = existing.docs[0].id as number;
    uploadedCache.set(name, id);
    return id;
  }

  const data = await readFile(absPath);
  const size = (await stat(absPath)).size;
  const mimetype = MIME_BY_EXT[extname(name).toLowerCase()] ?? "application/octet-stream";

  const created = await payload.create({
    collection: "media",
    data: { alt },
    file: { data, mimetype, name, size },
  });
  const id = created.id as number;
  uploadedCache.set(name, id);
  payload.logger.info(`Uploaded ${name} → id ${id}`);
  return id;
}

/* ── Media to seed ──────────────────────────────────── */

const HERO_MEDIA_PATH = "public/videos/marta_vid.mp4";

const GALLERY_ITEMS: { file: string; alt: string }[] = [
  { file: "client-selected-1.webp", alt: CONTENT.gallery.alts.cs1 },
  { file: "client-selected-2.webp", alt: CONTENT.gallery.alts.cs2 },
  { file: "secondary-reference-instagram-12.webp", alt: CONTENT.gallery.alts.ig12 },
  { file: "client-selected-4.webp", alt: CONTENT.gallery.alts.cs4 },
  { file: "client-selected-3.webp", alt: CONTENT.gallery.alts.cs3 },
  { file: "secondary-reference-instagram-17.webp", alt: CONTENT.gallery.alts.ig17 },
  { file: "secondary-reference-instagram-33.webp", alt: CONTENT.gallery.alts.ig33 },
  { file: "client-selected-5.webp", alt: CONTENT.gallery.alts.cs5 },
  { file: "client-selected-6.webp", alt: CONTENT.gallery.alts.cs6 },
  { file: "secondary-reference-instagram-25.webp", alt: CONTENT.gallery.alts.ig25 },
  { file: "client-selected-7.webp", alt: CONTENT.gallery.alts.cs7 },
  { file: "secondary-reference-instagram-35.webp", alt: CONTENT.gallery.alts.ig35 },
  { file: "client-selected-8.webp", alt: CONTENT.gallery.alts.cs8 },
  { file: "secondary-reference-instagram-36.webp", alt: CONTENT.gallery.alts.ig36 },
  { file: "client-selected-9.webp", alt: CONTENT.gallery.alts.cs9 },
  { file: "client-selected-10.webp", alt: CONTENT.gallery.alts.cs10 },
  { file: "secondary-reference-instagram-37.webp", alt: CONTENT.gallery.alts.ig37 },
  { file: "secondary-reference-instagram-38.webp", alt: CONTENT.gallery.alts.ig38 },
  { file: "secondary-reference-instagram-39.webp", alt: CONTENT.gallery.alts.ig39 },
];

const EBOOK_FILES = [
  "src/moodboard/ebook/ebook_1.webp",
  "src/moodboard/ebook/ebook_2.webp",
];

/* ── Upload everything ──────────────────────────────── */

const heroMediaId = await uploadFile(HERO_MEDIA_PATH, "Hero background");

const servicesBackgroundId = await uploadFile(
  "src/moodboard/gallery/candidates/spread-overhead.jpg",
  CONTENT.services.backgroundAlt,
);

const galleryIds = await Promise.all(
  GALLERY_ITEMS.map((g) =>
    uploadFile(`src/moodboard/gallery/${g.file}`, g.alt),
  ),
);

const ebookIds = await Promise.all(
  EBOOK_FILES.map((path, i) =>
    uploadFile(path, CONTENT.campFood.slides[i]?.alt ?? ""),
  ),
);

/* ── Seed the global ────────────────────────────────── */

await payload.updateGlobal({
  slug: "site",
  locale: "pl",
  data: {
    hero_tagline: CONTENT.hero.tagline,
    hero_heading_lines: CONTENT.hero.headingLines.map((l) => ({ text: l.text })),
    hero_lead: CONTENT.hero.lead,
    hero_ctas: CONTENT.hero.ctas.map((c) => ({ label: c.label, href: c.href })),
    hero_media: heroMediaId,

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
    services_background: servicesBackgroundId,
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
    camp_food_slides: CONTENT.campFood.slides.map((s, i) => ({
      alt: s.alt,
      description: s.description,
      image: ebookIds[i],
    })),

    gallery_eyebrow: CONTENT.gallery.eyebrow,
    gallery_heading: CONTENT.gallery.heading,
    gallery_handle: CONTENT.gallery.handle,
    gallery_images: galleryIds.map((id) => ({ image: id })),

    contact_eyebrow: CONTENT.contact.eyebrow,
    contact_heading_lines: CONTENT.contact.headingLines.map((l) => ({
      text: l.text,
      color: classToColor(l.className),
    })),
    contact_lead: CONTENT.contact.lead,
    contact_description: CONTENT.contact.description,
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
