import { Nav } from "@/components/home/nav";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { ServicesSlider } from "@/components/home/services-slider";
import { CampFoodSwiper } from "@/components/home/camp-food-swiper";
import { Gallery } from "@/components/home/gallery";
import { Contact } from "@/components/home/contact";
import { ContactV2 } from "@/components/home/contact-v2";
import { GrainOverlay } from "@/components/ui/grain-overlay";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
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
