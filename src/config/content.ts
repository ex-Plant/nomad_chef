import { SECTION_IDS } from "@/config/section-ids";

/* Single source of all user-facing text. Shape tracks the Payload
   collections/globals we'll swap in later — sections map to globals,
   nested arrays (slides, images) map to repeatable fields. */

export const CONTENT = {
  shared: {
    swiperControls: {
      prevLabel: "Poprzedni",
      nextLabel: "Następny",
    },
  },

  nav: {
    ariaLabel: "Nawigacja glowna",
    ariaItemPrefix: "Przejdz do sekcji",
    toggleOpenLabel: "Otworz menu",
    toggleCloseLabel: "Zamknij menu",
  },

  hero: {
    tagline: "Jedzenie dopasowane do miejsca, ludzi i momentu",
    headingLines: [{ text: "Nomad" }, { text: "Chef" }],
    lead: "Gotuje tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez garden party, po retreaty i wyjazdy w Polsce i za granica.",
    ctas: [
      { label: "Zobacz oferte", href: `#${SECTION_IDS.services}` },
      { label: "Napisz do mnie", href: `#${SECTION_IDS.contact}` },
    ],
  },

  about: {
    eyebrow: "O mnie",
    imageAlt: "Szefowa kuchni trzymająca talerz",
    headingLines: [
      { text: "Gotuję", className: "text-off-black" },
      { text: "prosto,", className: "text-off-black" },
      { text: "ale nigdy", className: "text-coral" },
      { text: "banalnie", className: "text-off-black" },
    ],
    intro:
      "Tworzę jedzenie dopasowane do ludzi i sytuacji — od kameralnych kolacji, przez eventy, po wyjazdy w miejscach, które rzadko mają cokolwiek wspólnego z klasyczną kuchnią.",
    quote:
      "Łączę smak z funkcją — jedzenie ma nie tylko smakować, ale też działać.",
    paragraphs: [
      "Pracuję na ekologicznych produktach, korzystam z fermentacji, świeżych ziół i składników wspierających organizm.",
      " Każde menu tworzę od podstaw. Dopasowuję je do stylu życia, potrzeb i energii wydarzenia.",
      "Moja droga do kuchni nie była oczywista — od banku, przez modę, po własną restaurację. Dziś pracuję jako nomadyczna kucharka, gotując w różnych miejscach świata.",
    ],
  },

  services: {
    eyebrow: "Usługi",
    backgroundAlt: "Tło sekcji usług — fotografia kulinarna",
    slides: [
      {
        title: "Prywatne doświadczenia kulinarne",
        tagline: "To nie jest catering. To jest doświadczenie.",
        description:
          "Kolacje i przyjęcia tworzę od podstaw -  w Twoim domu, ogrodzie lub wybranej przestrzeni.",
      },
      {
        title: "Catering premium i eventy",
        tagline: "Estetyka, smak i flow wydarzenia — wszystko spójne",
        description:
          "Garden party, bufet i finger food, live cooking. Estetyka, smak i flow wydarzenia - wszystko spójne.",
      },
      {
        title: "Retreaty i wyjazdy",
        tagline: "Gotowanie w ruchu. Adaptacja do miejsca i ludzi.",
        description:
          "Retreaty jogowe, wyjazdy wellness i sportowe, długoterminowa współpraca. Menu wspiera energię, regenerację i balans.",
      },
      {
        title: "Warsztaty i współprace",
        tagline: "Fermentacja / zero waste / kuchnia funkcjonalna.",
        description: "Projekty dla firm i marek",
      },
    ],
  },

  campFood: {
    eyebrow: "Ebook",
    kicker: "Mój pierwszy ebook.",
    headingLines: [{ text: "Camp" }, { text: "Food" }],
    cta: { label: "Kup ebook", href: "#" },
    slides: [
      {
        alt: "Camp Food — okładka ebooka, widok z przodu",
        description:
          "Jedzenie, które zabierasz ze sobą — w ruch, w naturę, w życie.",
      },
      {
        alt: "Camp Food — okładka ebooka, widok z tyłu",
        description:
          "38 przepisów opartych na prostocie, jakości i intuicji. Bez spiny. Bez zbędnych zasad.",
      },
    ],
  },

  gallery: {
    eyebrow: "Galeria",
    heading: "Galeria",
    handle: "@marta_leśniewska",
    /* Keyed by import alias — gallery.tsx maps src → alt by key. */
    alts: {
      cs1: "Ryż z pistacjami i mango",
      cs2: "Zioła w słoiku",
      cs3: "Złoty drink",
      cs4: "Stół pełny dań",
      cs5: "Szefowa kuchni z talerzem",
      cs6: "Ryż z pistacjami",
      cs7: "Uczta — widok z góry",
      cs8: "Jajko na niebieskim tle",
      cs9: "Danie na pomarańczowym tle",
      cs10: "Plating na różowym talerzu",
      ig12: "Fotografia kulinarna",
      ig17: "Fotografia kulinarna",
      ig25: "Jedzenie z Instagrama",
      ig33: "Jedzenie z Instagrama",
      ig35: "Fotografia kulinarna",
      ig36: "Jedzenie z Instagrama",
      ig37: "Jedzenie z Instagrama",
      ig38: "Kolorowy talerz",
      ig39: "Jedzenie z Instagrama",
    },
  },

  contact: {
    eyebrow: "Kontakt",
    headingLines: [
      { text: "Jeśli czujesz,", className: "text-coral" },
      { text: "że to coś", className: "text-coral" },
      { text: "dla Ciebie", className: "text-off-black" },
    ],
    lead: "— napisz.",
    description: "Każdą współpracę zaczynam od rozmowy.",
    email: {
      href: "mailto:hello@nomadchef.pl",
      label: "Email",
      value: "hello@nomadchef.pl",
    },
    instagram: {
      href: "https://instagram.com/mart_lesniewska",
      label: "Instagram",
      value: "@mart_lesniewska",
    },
    formPlaceholder: "Twoja wiadomość...",
    submit: {
      label: "Wyślij wiadomość",
      href: "mailto:hello@nomadchef.pl",
    },
    footer: "Nomad Chef",
  },
} as const;

export const NAV_ITEMS = [
  { id: SECTION_IDS.hero, label: "Start" },
  { id: SECTION_IDS.about, label: "O mnie" },
  { id: SECTION_IDS.services, label: "Usługi" },
  { id: SECTION_IDS.campFood, label: "Camp Food" },
  { id: SECTION_IDS.gallery, label: "Galeria" },
  { id: SECTION_IDS.contact, label: "Kontakt" },
] as const;
