export const SECTION_IDS = {
  hero: "hero",
  about: "o-mnie",
  services: "uslugi",
  campFood: "camp-food",
  gallery: "galeria",
  contact: "kontakt",
} as const;

export type SectionIdT = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_ITEMS = [
  { id: SECTION_IDS.hero, label: "Start" },
  { id: SECTION_IDS.about, label: "O mnie" },
  { id: SECTION_IDS.services, label: "Uslugi" },
  { id: SECTION_IDS.campFood, label: "Camp Food" },
  { id: SECTION_IDS.gallery, label: "Galeria" },
  { id: SECTION_IDS.contact, label: "Kontakt" },
] as const;
