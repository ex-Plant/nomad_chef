import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";
import { escapeHtml, buildGreeting } from "../escape-html";

type DownloadReadyArgsT = {
  customerFirstName?: string | null;
  downloadUrl: string;
  expiresLabel: string;
  omitLogo?: boolean;
};

export function generateDownloadReadyHtml(args: DownloadReadyArgsT): string {
  const items: EmailItemT[] = [
    { type: "text", content: buildGreeting(args.customerFirstName) },
    {
      type: "text",
      content:
        "Dziękujemy za zakup. Ebook możesz pobrać klikając w poniższy link:",
    },
    {
      type: "button",
      label: "Pobierz tutaj",
      url: args.downloadUrl,
    },
    {
      type: "text",
      content: `Link aktywny do ${escapeHtml(args.expiresLabel)}.`,
    },
    { type: "text", content: "Miłej lektury!" },
  ];

  return renderEmailShell({
    title: "Twoja książka jest gotowa do pobrania",
    items,
    omitLogo: args.omitLogo,
  });
}
