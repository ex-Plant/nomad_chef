import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { ServicesParallax } from "@/components/sections/services/services-parallax";
import { CampFoodSwiper } from "@/components/sections/camp-food/camp-food-swiper";
import { Gallery } from "@/components/sections/gallery/gallery";
import { Contact } from "@/components/sections/contact/contact";
import { GrainOverlay } from "@/components/ui/grain-overlay";

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
