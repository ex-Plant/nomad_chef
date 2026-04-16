import dynamic from "next/dynamic";
import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { GrainOverlay } from "@/components/ui/grain-overlay";

const ServicesSlider = dynamic(() =>
  import("@/components/sections/services/services-slider").then((m) => m.ServicesSlider)
);
const CampFoodSwiper = dynamic(() =>
  import("@/components/sections/camp-food/camp-food-swiper").then((m) => m.CampFoodSwiper)
);
const Gallery = dynamic(() =>
  import("@/components/sections/gallery/gallery").then((m) => m.Gallery)
);
const Contact = dynamic(() =>
  import("@/components/sections/contact/contact").then((m) => m.Contact)
);

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <ServicesSlider />
        <CampFoodSwiper />
        <Gallery />
        <Contact />
        {/* <ContactV2 /> */}
      </main>

      <GrainOverlay position="fixed" zIndex="z-50" />
    </>
  );
}
