"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "hero", label: "Start" },
  { id: "o-mnie", label: "O mnie" },
  { id: "uslugi", label: "Uslugi" },
  { id: "camp-food", label: "Camp Food" },
  { id: "galeria", label: "Galeria" },
  { id: "kontakt", label: "Kontakt" },
] as const;

const EASE = [0.32, 0.72, 0, 1] as const;

export function Nav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOnYellow, setIsOnYellow] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);

      const kontakt = document.getElementById("kontakt");
      const nav = navRef.current;
      if (kontakt && nav) {
        const kontaktRect = kontakt.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        setIsOnYellow(kontaktRect.top < navRect.bottom);
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

  const scrollTo = (id: string) => {
    setIsMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            ref={navRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-2 py-2 shadow-2xl backdrop-blur-sm transition-colors duration-300 ${
              isOnYellow
                ? "bg-coral"
                : "bg-yellow"
            }`}
            aria-label="Nawigacja glowna"
          >
            <div className="flex items-center gap-1">
              {/* Desktop nav links */}
              <ul className="hidden items-center gap-1 md:flex">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`relative rounded-full px-4 py-2 font-geist text-xs uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        activeSection === item.id
                          ? isOnYellow
                            ? "text-black"
                            : "text-white"
                          : isOnYellow
                            ? "text-white hover:text-white/80"
                            : "text-black hover:text-off-black"
                      }`}
                      aria-label={`Przejdz do sekcji ${item.label}`}
                    >
                      {activeSection === item.id && (
                        <motion.span
                          layoutId="d8-nav-pill"
                          className={`absolute inset-0 rounded-full ${
                            isOnYellow ? "bg-yellow" : "bg-coral"
                          }`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
                aria-label={isMobileOpen ? "Zamknij menu" : "Otworz menu"}
              >
                <motion.span
                  className={`block h-px w-4 ${isOnYellow ? "bg-white" : "bg-off-black"}`}
                  animate={
                    isMobileOpen
                      ? { rotate: 45, y: 3, width: 16 }
                      : { rotate: 0, y: 0, width: 16 }
                  }
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <motion.span
                  className={`block h-px w-4 ${isOnYellow ? "bg-white" : "bg-off-black"}`}
                  animate={
                    isMobileOpen
                      ? { rotate: -45, y: -3, width: 16 }
                      : { rotate: 0, y: 0, width: 16 }
                  }
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-yellow/95 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex flex-col items-center gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="font-instrument text-4xl text-off-black"
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: EASE,
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
