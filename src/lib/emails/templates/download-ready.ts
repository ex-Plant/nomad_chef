import { renderEmailShell } from "../render-shell";
import { EMAIL_COLORS, type EmailItemT } from "../constants";
import { escapeHtml, buildGreeting } from "../escape-html";

type DownloadReadyArgsT = {
  customerFirstName?: string | null;
  downloadUrl: string;
  expiresLabel: string;
  supportEmail: string;
  omitLogo?: boolean;
};

export function generateDownloadReadyHtml(args: DownloadReadyArgsT): string {
  const items: EmailItemT[] = [
    { type: "text", content: buildGreeting(args.customerFirstName) },
    { type: "text", content: "Dziękuję za zakup." },
    {
      type: "text",
      content: "Ebook możesz pobrać klikając w poniższy link:",
    },
    {
      type: "button",
      label: "Pobierz tutaj",
      url: args.downloadUrl,
    },
    {
      type: "text",
      content: `Link będzie aktywny do ${escapeHtml(args.expiresLabel)}.`,
    },
    {
      type: "text",
      content: `W przypadku jakichkolwiek problemów z pobraniem napisz do mnie: <a href="mailto:${args.supportEmail}" style="color: ${EMAIL_COLORS.coral};">${escapeHtml(args.supportEmail)}</a>`,
    },
    { type: "text", content: "Miłej lektury!" },
  ];

  return renderEmailShell({
    title: "Twój ebook jest gotowy do pobrania",
    items,
    omitLogo: args.omitLogo,
  });
}
