"use client";

import { motion } from "framer-motion";
import { CONTENT } from "@/config/content";
import type { SiteT } from "@/lib/get-site";
import { cn } from "@/helpers/cn";

type NavDesktopPropsT = {
  items: SiteT["nav"];
  activeSection: string;
  isOnYellow: boolean;
  scrollTo: (id: string) => void;
};

export function NavDesktop({
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
                "relative rounded-lg px-4 py-1 font-geist text-xs uppercase tracking-wide transition-colors duration-300 ease-brand",
                isActive && isOnYellow && "text-black",
                isActive && !isOnYellow && "text-white",
                !isActive && isOnYellow && "text-white hover:text-white/80",
                !isActive && !isOnYellow && "text-black hover:text-off-black"
              )}
              aria-label={`${CONTENT.nav.ariaItemPrefix} ${item.label}`}
            >
              {isActive && (
                <motion.span
                  layoutId="d8-nav-pill"
                  className={cn(
                    "absolute inset-0 rounded-lg",
                    isOnYellow ? "bg-yellow" : "bg-coral"
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
