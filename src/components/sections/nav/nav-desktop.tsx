"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m, motion, AnimatePresence } from "framer-motion";
import { CONTENT } from "@/config/content";
import { SECTION_IDS } from "@/config/section-ids";
import type { SectionIdT } from "@/config/section-ids";
import type { SiteT } from "@/lib/get-site";
import { cn } from "@/helpers/cn";
import { scrollToSection } from "@/helpers/scroll-to-section";
import { useBreakpoint } from "@/hooks/use-media-query";
import { Logo } from "@/components/shared/logo";

type NavDesktopPropsT = {
  items: SiteT["nav"];
  activeSection: string;
  isOnYellow: boolean;
  scrollTo: (id: string) => void;
};

function NavDesktop({
  items,
  activeSection,
  isOnYellow,
  scrollTo,
}: NavDesktopPropsT) {
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => scrollTo(item.id)}
              className={cn(
                "font-geist ease-brand relative rounded-lg px-3 py-1 text-xs tracking-wide uppercase transition-colors duration-300",
                isActive && isOnYellow && "text-black",
                isActive && !isOnYellow && "text-white",
                !isActive && isOnYellow && "text-white hover:text-white/80",
                !isActive && !isOnYellow && "hover:text-off-black text-black",
              )}
              aria-current={isActive ? "location" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="d8-nav-pill"
                  className={cn(
                    "absolute inset-0 rounded-lg",
                    isOnYellow ? "bg-yellow" : "bg-coral",
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* Desktop-only shell — owns the scroll listener that drives activeSection /
   isVisible / isOnYellow, and the floating animated nav bar. CSS-hidden on
   mobile; the scroll effect also self-gates so it does zero work there. */
export function NavDesktopShell({ items }: { items: SiteT["nav"] }) {
  const [activeSection, setActiveSection] = useState<SectionIdT>(
    SECTION_IDS.hero,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isOnYellow, setIsOnYellow] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isDesktop = useBreakpoint("md");

  useEffect(() => {
    if (!isDesktop) return;
    let rafId = 0;

    const update = () => {
      rafId = 0;

      const shouldBeVisible = window.scrollY > 100;
      setIsVisible((prev) =>
        prev === shouldBeVisible ? prev : shouldBeVisible,
      );

      const nav = navRef.current;
      const kontakt = document.getElementById(SECTION_IDS.contact);
      if (kontakt && nav) {
        const kontaktRect = kontakt.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const shouldBeOnYellow = kontaktRect.top < navRect.bottom;

        setIsOnYellow((prev) =>
          prev === shouldBeOnYellow ? prev : shouldBeOnYellow,
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
        else break;
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
  }, [items, isDesktop]);

  const scrollTo = useCallback((id: string) => {
    scrollToSection(id);
  }, []);
  return (
    <nav
      ref={navRef}
      className="fixed -top-2 right-0 left-2 z-250 hidden items-center justify-between lg:flex"
      aria-label={`${CONTENT.nav.ariaLabel} (desktop)`}
    >
      <Logo priority className="pointer-events-none mr-auto opacity-0" />

      <AnimatePresence>
        {isVisible && (
          <m.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "rounded-lg bg-transparent px-2 py-1 shadow-2xl transition-colors duration-1000",
              isOnYellow ? "bg-coral" : "bg-yellow",
            )}
          >
            <NavDesktop
              items={items}
              activeSection={activeSection}
              isOnYellow={isOnYellow}
              scrollTo={scrollTo}
            />
          </m.div>
        )}
      </AnimatePresence>
      <Logo priority className="mr-4 ml-auto" />
    </nav>
  );
}
