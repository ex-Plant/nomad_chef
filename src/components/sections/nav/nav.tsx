"use client";

import type { SiteT } from "@/lib/get-site";
import { NavDesktopShell } from "@/components/sections/nav/nav-desktop";
import { NavMobileShell } from "@/components/sections/nav/nav-mobile";

type NavPropsT = { items: SiteT["nav"] };

export function Nav({ items }: NavPropsT) {
  return (
    <>
      <NavMobileShell items={items} />
      <NavDesktopShell items={items} />
    </>
  );
}
