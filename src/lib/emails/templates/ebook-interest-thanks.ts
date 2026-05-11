import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

type EbookInterestThanksArgsT = {
  omitLogo?: boolean;
};

export function generateEbookInterestThanksHtml(
  args: EbookInterestThanksArgsT = {},
): string {
  const items: EmailItemT[] = [
    { type: "text", content: "Cześć," },
    {
      type: "text",
      content:
        "Dzięki za zainteresowanie moim e-bookiem.\nOdezwę się jak tylko ruszy sprzedaż.",
    },
  ];

  return renderEmailShell({
    items,
    omitLogo: args.omitLogo,
  });
}
