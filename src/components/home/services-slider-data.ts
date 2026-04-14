import type { StaticImageData } from "next/image";

import clientSelected7 from "@/app/moodboard/gallery/client-selected-7.webp";
import clientSelected10 from "@/app/moodboard/gallery/client-selected-10.webp";
import secondaryRef5 from "@/app/moodboard/gallery/secondary-reference-instagram-5.webp";
import secondaryRef34 from "@/app/moodboard/gallery/secondary-reference-instagram-34.webp";
import secondaryRef35 from "@/app/moodboard/gallery/secondary-reference-instagram-35.webp";
import secondaryRef39 from "@/app/moodboard/gallery/secondary-reference-instagram-39.webp";
import freshVeggiesTopdown from "@/app/moodboard/gallery/candidates/fresh-veggies-colorful-topdown.jpg";
import vividVeggieBowl from "@/app/moodboard/gallery/candidates/vivid-veggie-bowl.jpg";
import tableFeast from "@/app/moodboard/gallery/candidates/table-feast.jpg";

/* ─── All available images (commented out for testing) ─── */

// Gallery — client-selected
// import clientSelected1 from "@/app/moodboard/gallery/client-selected-1.webp";
// import clientSelected2 from "@/app/moodboard/gallery/client-selected-2.webp";
// import clientSelected3 from "@/app/moodboard/gallery/client-selected-3.webp";
// import clientSelected4 from "@/app/moodboard/gallery/client-selected-4.webp";
// import clientSelected5 from "@/app/moodboard/gallery/client-selected-5.webp";
// import clientSelected6 from "@/app/moodboard/gallery/client-selected-6.webp";
// import clientSelected8 from "@/app/moodboard/gallery/client-selected-8.webp";
// import clientSelected9 from "@/app/moodboard/gallery/client-selected-9.webp";
// import clientSelected11 from "@/app/moodboard/gallery/client-selected-11.webp";

// Gallery — secondary references
// import secondaryRef4 from "@/app/moodboard/gallery/secondary-reference-instagram-4.webp";
// import secondaryRef12 from "@/app/moodboard/gallery/secondary-reference-instagram-12.webp";
// import secondaryRef17 from "@/app/moodboard/gallery/secondary-reference-instagram-17.webp";
// import secondaryRef22 from "@/app/moodboard/gallery/secondary-reference-instagram-22.webp";
// import secondaryRef25 from "@/app/moodboard/gallery/secondary-reference-instagram-25.webp";
// import secondaryRef32 from "@/app/moodboard/gallery/secondary-reference-instagram-32.webp";
// import secondaryRef33 from "@/app/moodboard/gallery/secondary-reference-instagram-33.webp";
// import secondaryRef36 from "@/app/moodboard/gallery/secondary-reference-instagram-36.webp";
// import secondaryRef37 from "@/app/moodboard/gallery/secondary-reference-instagram-37.webp";
// import secondaryRef38 from "@/app/moodboard/gallery/secondary-reference-instagram-38.webp";

// Marta photos
// import martaRef3 from "@/app/moodboard/marta_photos/secondary-reference-instagram-3.webp";
// import martaRef6 from "@/app/moodboard/marta_photos/secondary-reference-instagram-6.webp";
// import martaRef19 from "@/app/moodboard/marta_photos/secondary-reference-instagram-19.webp";
// import martaRef24 from "@/app/moodboard/marta_photos/secondary-reference-instagram-24.webp";
// import martaRef28 from "@/app/moodboard/marta_photos/secondary-reference-instagram-28.webp";
// import martaRef31 from "@/app/moodboard/marta_photos/secondary-reference-instagram-31.webp";

// Root moodboard — secondary references
// import secondaryRef41 from "@/app/moodboard/secondary-reference-instagram-41.webp";
// import secondaryRef42 from "@/app/moodboard/secondary-reference-instagram-42.webp";
// import secondaryRef43 from "@/app/moodboard/secondary-reference-instagram-43.webp";
// import secondaryRef44 from "@/app/moodboard/secondary-reference-instagram-44.webp";
// import secondaryRef46 from "@/app/moodboard/secondary-reference-instagram-46.webp";
// import secondaryRef47 from "@/app/moodboard/secondary-reference-instagram-47.webp";

// Ebook
// import ebookFront from "@/app/moodboard/ebook/ebook_1.webp";
// import ebookBack from "@/app/moodboard/ebook/ebook_2.webp";

// Candidates
// import spreadOverhead from "@/app/moodboard/gallery/candidates/spread-overhead.jpg";
// import vividSaladBowl from "@/app/moodboard/gallery/candidates/vivid-salad-bowl.jpg";
// import foodYellowBg from "@/app/moodboard/gallery/candidates/food-yellow-bg.jpg";
// import grilledMeatDark from "@/app/moodboard/gallery/candidates/grilled-meat-dark.jpg";
// import pancakesBerries from "@/app/moodboard/gallery/candidates/pancakes-berries.jpg";
// import colorfulSaladPlate from "@/app/moodboard/gallery/candidates/colorful-salad-plate.jpg";
// import donutsColorful from "@/app/moodboard/gallery/candidates/donuts-colorful.jpg";
// import pastaVibrant from "@/app/moodboard/gallery/candidates/pasta-vibrant.jpg";
// import tacosColorful from "@/app/moodboard/gallery/candidates/tacos-colorful.jpg";
// import pinkSmoothieBowl from "@/app/moodboard/gallery/candidates/pink-smoothie-bowl.jpg";
// import cakeBerriesBright from "@/app/moodboard/gallery/candidates/cake-berries-bright.jpg";
// import ramenVivid from "@/app/moodboard/gallery/candidates/ramen-vivid.jpg";
// import brightBowlOverhead from "@/app/moodboard/gallery/candidates/bright-bowl-overhead.jpg";
// import avocadoToastEditorial from "@/app/moodboard/gallery/candidates/avocado-toast-editorial.jpg";
// import smoothieBowlsBright from "@/app/moodboard/gallery/candidates/smoothie-bowls-bright.jpg";
// import grilledSkewersWarm from "@/app/moodboard/gallery/candidates/grilled-skewers-warm.jpg";
// import pastaRedSauceBright from "@/app/moodboard/gallery/candidates/pasta-red-sauce-bright.jpg";
// import acaiBowlPink from "@/app/moodboard/gallery/candidates/acai-bowl-pink.jpg";
// import plateBlueBg from "@/app/moodboard/gallery/candidates/plate-blue-bg.jpg";
// import colorfulBowlsSpread from "@/app/moodboard/gallery/candidates/colorful-bowls-spread.jpg";
// import plateYellowBg from "@/app/moodboard/gallery/candidates/plate-yellow-bg.jpg";
// import pinkIceCreamBlueBg from "@/app/moodboard/gallery/candidates/pink-ice-cream-blue-bg.jpg";
// import freshIngredientsTopdown from "@/app/moodboard/gallery/candidates/fresh-ingredients-topdown.jpg";
// import pokeBowlBright from "@/app/moodboard/gallery/candidates/poke-bowl-bright.jpg";
// import creativeSushiArt from "@/app/moodboard/gallery/candidates/creative-sushi-art.jpg";
// import flatlayColorfulIngredients from "@/app/moodboard/gallery/candidates/flatlay-colorful-ingredients.jpg";
// import spicesColorfulTopdown from "@/app/moodboard/gallery/candidates/spices-colorful-topdown.jpg";
// import smoothieBowlPinkTopdown from "@/app/moodboard/gallery/candidates/smoothie-bowl-pink-topdown.jpg";
// import colorfulThaiFood from "@/app/moodboard/gallery/candidates/colorful-thai-food.jpg";
// import pizzaOverheadWarm from "@/app/moodboard/gallery/candidates/pizza-overhead-warm.jpg";
// import thaiSoupVivid from "@/app/moodboard/gallery/candidates/thai-soup-vivid.jpg";
// import dimSumColorful from "@/app/moodboard/gallery/candidates/dim-sum-colorful.jpg";
// import tropicalBowlBright from "@/app/moodboard/gallery/candidates/tropical-bowl-bright.jpg";
// import beetHummusPink from "@/app/moodboard/gallery/candidates/beet-hummus-pink.jpg";
// import tacosPinkBg from "@/app/moodboard/gallery/candidates/tacos-pink-bg.jpg";
// import macaronsPastel from "@/app/moodboard/gallery/candidates/macarons-pastel.jpg";
// import editorialPlateBright from "@/app/moodboard/gallery/candidates/editorial-plate-bright.jpg";
// import fineDiningPlate from "@/app/moodboard/gallery/candidates/fine-dining-plate.jpg";
// import veggiesSpreadDark from "@/app/moodboard/gallery/candidates/veggies-spread-dark.jpg";
// import noodlesFullframe from "@/app/moodboard/gallery/candidates/noodles-fullframe.jpg";
// import mediterraneanSpread from "@/app/moodboard/gallery/candidates/mediterranean-spread.jpg";
// import riceBowlTopdown from "@/app/moodboard/gallery/candidates/rice-bowl-topdown.jpg";
// import indianCurryWarm from "@/app/moodboard/gallery/candidates/indian-curry-warm.jpg";

export type ServiceSlideT = {
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly image: StaticImageData;
  readonly alt: string;
  readonly imagePosition?: string;
};

export const SLIDES_EDITORIAL: readonly ServiceSlideT[] = [
  {
    title: "Prywatne doświadczenia kulinarne",
    tagline: "To nie jest catering. To jest doświadczenie.",
    description:
      "Kolacje i przyjęcia tworzę od podstaw, z tempem i serwisem dopasowanym do domu, ogrodu albo wyjątkowej przestrzeni.",
    image: secondaryRef5,
    alt: "Nastrojowa kolacja przy świecach w eleganckim wnętrzu",
    imagePosition: "object-center",
  },
  {
    title: "Catering premium & eventy",
    tagline: "Estetyka, smak i flow wydarzenia trzymam w jednym tonie.",
    description:
      "Garden party, bufety, finger food i live cooking bez ciężkości klasycznego cateringu.",
    image: clientSelected7,
    alt: "Kolorowy stół pełen dań i napojów",
    imagePosition: "object-center",
  },
  {
    title: "Retreaty & wyjazdy",
    tagline: "Menu wspiera energię, regenerację i balans.",
    description:
      "Gotowanie w ruchu, dla grup wellness i wyjazdów, gdzie jedzenie ma pracować razem z planem dnia.",
    image: freshVeggiesTopdown,
    alt: "Kompozycja ze świeżych zielonych warzyw i dodatków",
    imagePosition: "object-center",
  },
  {
    title: "Warsztaty & współprace",
    tagline: "Wiedza, która zostaje i wygląda jak część marki.",
    description:
      "Warsztaty kulinarne, fermentacja, zero waste i projekty dla marek w bardziej edytorialnym ujęciu.",
    image: secondaryRef34,
    alt: "Jajko sadzone na bułce bao z zielonymi dodatkami",
    imagePosition: "object-center",
  },
] as const;
