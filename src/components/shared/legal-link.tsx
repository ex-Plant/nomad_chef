import Link from "next/link";
import type { LegalLinkT } from "@/types/site";
import { cn } from "@/helpers/cn";

type LegalLinkPropsT = {
  link: LegalLinkT;
  className?: string;
};

export function LegalLink({ link, className }: LegalLinkPropsT) {
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
