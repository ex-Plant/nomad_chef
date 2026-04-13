import { Nav } from '@/components/design-8/nav';
import { Hero } from '@/components/design-8/hero';
import { About } from '@/components/design-8/about';
import { Services } from '@/components/design-8/services';
import { CampFood } from '@/components/design-8/camp-food';
import { Gallery } from '@/components/design-8/gallery';
import { Contact } from '@/components/design-8/contact';
import { CursorDot } from '@/components/design-8/cursor-dot';

export default function HomePage() {
  return (
    <>
      <CursorDot />
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <CampFood />
        <Gallery />
        <Contact />
      </main>

      {/* Grain overlay — fixed, pointer-events-none for GPU perf */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />
    </>
  );
}
