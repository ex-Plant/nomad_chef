import { Nav } from "@/components/home/nav";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { ServicesSlider } from "@/components/home/services-slider";
import { CampFoodSwiper } from "@/components/home/camp-food-swiper";
import { CampFoodSplit } from "@/components/home/camp-food-split";
import { Gallery } from "@/components/home/gallery";
import { Contact } from "@/components/home/contact";

export default function EbookSwiperPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <ServicesSlider />
        <CampFoodSwiper />
        <CampFoodSplit />
        <Gallery />
        <Contact />
      </main>

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
        aria-hidden="true"
      />
    </>
  );
}
