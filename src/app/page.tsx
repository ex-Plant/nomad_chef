import { getSite } from "@/lib/get-site";
import { Nav } from "@/components/sections/nav/nav";
import { Hero } from "@/components/sections/hero/hero";
import { About } from "@/components/sections/about/about";
import { ServicesParallax } from "@/components/sections/services/services-parallax";
import { CampFoodSwiper } from "@/components/sections/camp-food/camp-food-swiper";
import { Gallery } from "@/components/sections/gallery/gallery";
import { Contact } from "@/components/sections/contact/contact";
import { GrainOverlay } from "@/components/ui/grain-overlay";

export default async function HomePage() {
  const site = await getSite("pl");

  return (
    <>
      <Nav items={site.nav} />
      <main className="relative bg-warm-white">
        <Hero data={site.hero} />
        <About data={site.about} />
        <ServicesParallax data={site.services} />
        <CampFoodSwiper data={site.campFood} />
        <Gallery data={site.gallery} />
        <Contact data={site.contact} />
      </main>

      <GrainOverlay position="fixed" zIndex="z-50" />
    </>
  );
}
