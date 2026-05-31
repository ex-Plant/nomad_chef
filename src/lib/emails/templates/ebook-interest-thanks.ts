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
        "Dzięki za zainteresowanie moim e-bookiem.\nLink do pobrania prześlę w osobnej wiadomości jak tylko otrzymam potwierdzenie wpłaty.",
    },
  ];

  return renderEmailShell({
    items,
    omitLogo: args.omitLogo,
  });
}
