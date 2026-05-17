import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

type DownloadReadyArgsT = {
  customerFirstName?: string | null;
  downloadUrl: string;
  expiresLabel: string;
  omitLogo?: boolean;
};

export function generateDownloadReadyHtml(args: DownloadReadyArgsT): string {
  const greeting = args.customerFirstName
    ? `Cześć ${escapeHtml(args.customerFirstName)},`
    : "Cześć,";

  const items: EmailItemT[] = [
    { type: "text", content: greeting },
    {
      type: "text",
      content: "Dziękujemy za zakup. Pobierz swoją książkę:",
    },
    {
      type: "button",
      label: "Pobierz książkę",
      url: args.downloadUrl,
    },
    {
      type: "text",
      content: `Link aktywny do ${escapeHtml(args.expiresLabel)}.`,
    },
    {
      type: "text",
      content:
        'Jeśli masz problem z pobraniem, kliknij na stronie „Mam problem" i napisz do nas — odezwiemy się indywidualnie.',
    },
    { type: "text", content: "Miłej lektury!" },
  ];

  return renderEmailShell({
    title: "Twoja książka jest gotowa do pobrania",
    items,
    omitLogo: args.omitLogo,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
