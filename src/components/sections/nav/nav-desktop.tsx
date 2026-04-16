"use client";

import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/config/section-ids";

type NavDesktopPropsT = {
  activeSection: string;
  isOnYellow: boolean;
  scrollTo: (id: string) => void;
};

export function NavDesktop({
  activeSection,
  isOnYellow,
  scrollTo,
}: NavDesktopPropsT) {
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => scrollTo(item.id)}
            className={`relative rounded-lg px-4 py-1 font-geist text-xs uppercase tracking-wide transition-colors duration-300 ease-brand ${
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
                className={`absolute inset-0 rounded-lg ${
                  isOnYellow ? "bg-yellow" : "bg-coral"
                }`}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap ">
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
