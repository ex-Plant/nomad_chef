import Link from "next/link";
import type { SiteT } from "@/lib/get-site";
import { cn } from "@/helpers/cn";

type LegalLinkPropsT = {
  kind: "terms" | "privacy";
  links?: SiteT["legalLinks"];
  className?: string;
};

export function LegalLink({ kind, links, className }: LegalLinkPropsT) {
  const link = links?.[kind];
  if (!link) return null;
  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hover:text-yellow underline underline-offset-3",
        className,
      )}
    >
      {link.label}
    </Link>
  );
}
