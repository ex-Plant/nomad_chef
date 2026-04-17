"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, SECTION_IDS } from "@/config/section-ids";
import type { SectionIdT } from "@/config/section-ids";
import { NavDesktop } from "@/components/sections/nav/nav-desktop";
import {
  NavMobileToggle,
  NavMobileOverlay,
} from "@/components/sections/nav/nav-mobile";
import { cn } from "@/helpers/cn";

export function Nav() {
  const [activeSection, setActiveSection] = useState<SectionIdT>(
    SECTION_IDS.hero
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnYellow, setIsOnYellow] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeVisible = window.scrollY > 100;
      setIsVisible((prev) =>
        prev === shouldBeVisible ? prev : shouldBeVisible
      );

      const kontakt = document.getElementById(SECTION_IDS.contact);
      const nav = navRef.current;
      if (kontakt && nav) {
        const kontaktRect = kontakt.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const shouldBeOnYellow = kontaktRect.top < navRect.bottom;
        setIsOnYellow((prev) =>
          prev === shouldBeOnYellow ? prev : shouldBeOnYellow
        );
      }
    };

    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        // Pick the deepest-scrolled intersecting section (last in DOM order).
        // Using a band via rootMargin + threshold: 0 so sections taller than
        // the viewport (services parallax, camp-food swiper) still register.
        for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
          if (intersecting.has(NAV_ITEMS[i].id)) {
            const nextId = NAV_ITEMS[i].id as SectionIdT;
            setActiveSection((prev) => (prev === nextId ? prev : nextId));
            break;
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    window.addEventListener("scroll", handleScroll);

    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileOpen]);

  const scrollTo = useCallback((id: string) => {
    setIsMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
              "fixed top-6 right-6 z-50 rounded-lg bg-transparent px-2 py-2 transition-colors duration-1000 bg-blend-difference",
              "md:right-auto md:left-1/2 md:-translate-x-1/2 md:shadow-2xl",
              isMobileOpen || isOnYellow ? "md:bg-coral" : "md:bg-yellow"
            )}
            aria-label="Nawigacja glowna"
          >
            <div className="flex items-center gap-1">
              <NavDesktop
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

      <NavMobileOverlay isOpen={isMobileOpen} scrollTo={scrollTo} />
    </>
  );
}
