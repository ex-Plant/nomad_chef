import dynamic from "next/dynamic";
import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { GrainOverlay } from "@/components/ui/grain-overlay";

const ServicesParallax = dynamic(() =>
  import("@/components/sections/services/services-parallax").then(
    (m) => m.ServicesParallax
  )
);
const CampFoodSwiper = dynamic(() =>
  import("@/components/sections/camp-food/camp-food-swiper").then(
    (m) => m.CampFoodSwiper
  )
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
        {/* <ServicesSlider /> */}
        <ServicesParallax />
        <CampFoodSwiper />
        <Gallery />
        <Contact />
        {/* <ContactV2 /> */}
      </main>

      <GrainOverlay position="fixed" zIndex="z-50" />
    </>
  );
}
