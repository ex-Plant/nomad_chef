"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, SECTION_IDS } from "@/components/home/section-ids";
import { NavDesktop } from "@/components/home/nav-desktop";
import {
  NavMobileToggle,
  NavMobileOverlay,
} from "@/components/home/nav-mobile";

export function Nav() {
  const [activeSection, setActiveSection] = useState("hero");
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.3 }
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
            className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-2 py-2 shadow-2xl transition-colors duration-1000 ${
              isMobileOpen ? "bg-coral" : isOnYellow ? "bg-coral" : "bg-yellow"
            }`}
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
                isOnYellow={isOnYellow}
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
