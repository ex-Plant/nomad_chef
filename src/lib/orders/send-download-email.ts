import { sendEmail } from "@/lib/email";
import { ENV } from "@/config/env";

type SendArgsT = {
  customerEmail: string;
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
  const downloadUrl = `${ENV.SITE_URL}/download/${downloadToken}`;
  const greeting = customerFirstName ? `Cześć ${customerFirstName},` : "Cześć,";
  const expiresLabel = downloadExpiresAt.toLocaleDateString("pl-PL");

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
