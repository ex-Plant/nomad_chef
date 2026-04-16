import dynamic from "next/dynamic";
import { Nav } from "@/components/home/nav";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { GrainOverlay } from "@/components/ui/grain-overlay";

const ServicesSlider = dynamic(() =>
  import("@/components/home/services-slider").then((m) => m.ServicesSlider)
);
const CampFoodSwiper = dynamic(() =>
  import("@/components/home/camp-food-swiper").then((m) => m.CampFoodSwiper)
);
const Gallery = dynamic(() =>
  import("@/components/home/gallery").then((m) => m.Gallery)
);
const Contact = dynamic(() =>
  import("@/components/home/contact").then((m) => m.Contact)
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
