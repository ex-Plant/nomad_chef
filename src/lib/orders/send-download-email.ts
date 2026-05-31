import { sendEmail } from "@/lib/emails/send";
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
    subject: "Twój ebook jest gotowy do pobrania",
    text: [
      greeting,
      "",
      "Dziękuję za zakup.",
      "Ebook możesz pobrać klikając w poniższy link:",
      downloadUrl,
      "",
      `Link będzie aktywny do ${expiresLabel}.`,
      "",
      `W przypadku jakichkolwiek problemów z pobraniem napisz do mnie: ${ENV.MARTA_EMAIL}`,
      "",
      "Miłej lektury!",
    ].join("\n"),
    html: generateDownloadReadyHtml({
      customerFirstName,
      downloadUrl,
      expiresLabel,
      supportEmail: ENV.MARTA_EMAIL,
    }),
  });
}
