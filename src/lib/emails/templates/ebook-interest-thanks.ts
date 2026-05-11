import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

type EbookInterestThanksArgsT = {
  omitLogo?: boolean;
};

export function generateEbookInterestThanksHtml(
  args: EbookInterestThanksArgsT = {},
): string {
  const items: EmailItemT[] = [
    { type: "text", content: "Dzięki za zainteresowanie e-bookiem." },
    { type: "text", content: "Odezwę się jak tylko ruszy sprzedaż." },
  ];

  return renderEmailShell({
    items,
    footer: "Marta",
    omitLogo: args.omitLogo,
  });
}
