export const SECTION_IDS = {
  hero: "hero",
  about: "o-mnie",
  services: "uslugi",
  campFood: "camp-food",
  gallery: "galeria",
  contact: "kontakt",
} as const;

export type SectionIdT = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export type NavToggleColorT = "yellow" | "coral";

export const NAV_TOGGLE_COLORS = {
  [SECTION_IDS.hero]: "yellow",
  [SECTION_IDS.about]: "coral",
  [SECTION_IDS.services]: "yellow",
  [SECTION_IDS.campFood]: "coral",
  [SECTION_IDS.gallery]: "yellow",
  [SECTION_IDS.contact]: "coral",
} as const satisfies Record<SectionIdT, NavToggleColorT>;
