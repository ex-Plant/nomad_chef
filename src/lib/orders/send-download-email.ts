/**
 * Renders and sends the "your ebook is ready" email.
 *
 * Extracted into its own module because two different places trigger it:
 *   1. The first delivery, from the digital-fulfillment hook when the
 *      order flips to paid.
 *   2. The resend route (/api/download/<token>/resend) when a customer
 *      asks for a fresh link after expiry or hitting the attempts limit.
 *
 * Keeping the email text in one file means a copy or formatting change
 * automatically applies to both flows.
 */

import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";

type SendArgsT = {
  customerEmail: string;
  // Optional because guest customers might not have provided a first name
  // — the email still works, it just opens with "Cześć,".
  customerFirstName?: string | null;
  downloadToken: string;
  downloadExpiresAt: Date;
  downloadLimit: number;
};

export async function sendDownloadEmail({
  customerEmail,
  customerFirstName,
  downloadToken,
  downloadExpiresAt,
  downloadLimit,
}: SendArgsT): Promise<void> {
  // `ENV.SITE_URL` is the canonical production URL (https://www.chaoskitchen.pl)
  // — never a preview/Vercel URL. We always build absolute links in email
  // because Gmail/Apple Mail can't resolve relative paths.
  const downloadUrl = `${ENV.SITE_URL}/download/${downloadToken}`;
  const greeting = customerFirstName ? `Cześć ${customerFirstName},` : "Cześć,";
  const expiresLabel = downloadExpiresAt.toLocaleDateString("pl-PL");

  // Plain-text email (no HTML template yet). Each array entry is one line;
  // `.join("\n")` builds the body. Easier to scan/diff than a multi-line
  // template literal with embedded variables.
  await sendEmail({
    to: customerEmail,
    subject: "Twoja książka jest gotowa do pobrania",
    text: [
      greeting,
      "",
      "Dziękujemy za zakup. Pobierz swoją książkę:",
      downloadUrl,
      "",
      `Link wygasa ${expiresLabel}, masz ${downloadLimit} prób pobrania.`,
      "",
      "Miłej lektury!",
    ].join("\n"),
  });
}
