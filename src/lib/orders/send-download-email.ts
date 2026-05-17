import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";
import { generateDownloadReadyHtml } from "@/lib/emails/templates/download-ready";

type SendArgsT = {
  customerEmail: string;
  customerFirstName?: string | null;
  downloadToken: string;
  downloadExpiresAt: Date;
};

export async function sendDownloadEmail({
  customerEmail,
  customerFirstName,
  downloadToken,
  downloadExpiresAt,
}: SendArgsT): Promise<void> {
  const downloadUrl = `${ENV.SITE_URL}/download/${downloadToken}`;
  const greeting = customerFirstName ? `Cześć ${customerFirstName},` : "Cześć,";
  const expiresLabel = downloadExpiresAt.toLocaleString("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
  });

  await sendEmail({
    to: customerEmail,
    subject: "Twoja książka jest gotowa do pobrania",
    text: [
      greeting,
      "",
      "Dziękujemy za zakup. Pobierz swoją książkę:",
      downloadUrl,
      "",
      `Link aktywny do ${expiresLabel}.`,
      "",
      'Jeśli masz problem z pobraniem, kliknij na stronie "Mam problem" i napisz do nas — odezwiemy się indywidualnie.',
      "",
      "Miłej lektury!",
    ].join("\n"),
    html: generateDownloadReadyHtml({
      customerFirstName,
      downloadUrl,
      expiresLabel,
    }),
  });
}
