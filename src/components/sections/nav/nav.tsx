"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { SECTION_IDS } from "@/config/section-ids";
import type { SectionIdT } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import type { SiteT } from "@/lib/get-site";
import { NavDesktop } from "@/components/sections/nav/nav-desktop";
import {
  NavMobileToggle,
  NavMobileOverlay,
} from "@/components/sections/nav/nav-mobile";
import { cn } from "@/helpers/cn";
import { scrollToSection } from "@/helpers/scroll-to-section";

type NavPropsT = { items: SiteT["nav"] };

export function Nav({ items }: NavPropsT) {
  const [activeSection, setActiveSection] = useState<SectionIdT>(
    SECTION_IDS.hero
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnYellow, setIsOnYellow] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Active section = the one currently sitting under the nav bar.
    // A section becomes active the moment its top scrolls past the nav's
    // bottom edge, so the nav always reflects the section it's visually on.
    let rafId = 0;

    const update = () => {
      rafId = 0;

      const shouldBeVisible = window.scrollY > 100;
      setIsVisible((prev) =>
        prev === shouldBeVisible ? prev : shouldBeVisible
      );

      const nav = navRef.current;
      const kontakt = document.getElementById(SECTION_IDS.contact);
      if (kontakt && nav) {
        const kontaktRect = kontakt.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const shouldBeOnYellow = kontaktRect.top < navRect.bottom;

        setIsOnYellow((prev) =>
          prev === shouldBeOnYellow ? prev : shouldBeOnYellow
        );
      }

      const isAtBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight;

      if (isAtBottom) {
        setActiveSection("kontakt");
        return;
      }

      const line = nav ? nav.getBoundingClientRect().bottom : 0;
      let nextId: SectionIdT | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= line) nextId = item.id as SectionIdT;
        else break; // NAV_ITEMS are in DOM order; once one is below, rest are too
      }
      if (nextId) {
        setActiveSection((prev) => (prev === nextId ? prev : nextId));
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [items]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileOpen]);

  const scrollTo = useCallback((id: string) => {
    setIsMobileOpen(false);
    scrollToSection(id);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <m.nav
            ref={navRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed top-2 md:top-6 right-6 z-50 rounded-lg bg-transparent py-1 transition-colors duration-1000 ",
              "mobile-nav-stable",
              "md:right-auto md:left-1/2 md:-translate-x-1/2 md:px-2 md:shadow-2xl",
              isMobileOpen || isOnYellow ? "md:bg-coral" : "md:bg-yellow"
            )}
            aria-label={CONTENT.nav.ariaLabel}
          >
            <div className="flex items-center gap-1">
              <NavDesktop
                items={items}
                activeSection={activeSection}
                isOnYellow={isOnYellow}
                scrollTo={scrollTo}
              />
              <NavMobileToggle
                isOpen={isMobileOpen}
                activeSection={activeSection}
                onToggle={() => setIsMobileOpen(!isMobileOpen)}
              />
            </div>
          </m.nav>
        )}
      </AnimatePresence>

      <NavMobileOverlay
        items={items}
        isOpen={isMobileOpen}
        scrollTo={scrollTo}
      />
    </>
  );
}
