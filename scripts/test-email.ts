/**
 * Manual email test runner. Sends one rendered template to a recipient via the
 * real SMTP transport. Fixtures mirror src/app/(site)/email-previews/page.tsx.
 *
 * Usage:
 *   SITE_URL=https://www.chaoskitchen.pl \
 *     node --env-file=.env --import tsx scripts/test-email.ts <template-id> [recipient]
 *
 * The SITE_URL override points the logo <img> at production so Gmail's image
 * proxy can load it — ngrok-free serves an interstitial to GoogleImageProxy.
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { generateOrderConfirmationHtml } from "../src/lib/emails/templates/order-confirmation";
import { generateContactMessageHtml } from "../src/lib/emails/templates/contact-message";
import { generateDownloadReadyHtml } from "../src/lib/emails/templates/download-ready";
import { generateShipmentNotificationHtml } from "../src/lib/emails/templates/shipment-notification";

const DEFAULT_TO = "konradantonik@gmail.com";

type TestEmailT = {
  subject: string;
  text: string;
  html: string;
};

const TEMPLATES: Record<string, () => TestEmailT> = {
  "order-confirmation": () => ({
    subject: "Nowe zamówienie CK-2026-0042",
    text: "Dziękujemy za zamówienie CK-2026-0042.",
    html: generateOrderConfirmationHtml({
      orderNumber: "CK-2026-0042",
      productTitle: "Ebook: Smaki z plecaka",
      productFormat: "digital",
      quantity: 1,
      totalGross: 79,
      customerFirstName: "Anna",
      customerLastName: "Kowalska",
      customerEmail: "anna.kowalska@example.com",
      invoice: { companyName: "Kowalska Studio Sp. z o.o.", nip: "1234567890" },
      adminUrl: "https://www.chaoskitchen.pl/admin/collections/orders/123",
    }),
  }),
  "contact-message": () => ({
    subject: "Wiadomość z formularza kontaktowego chaoskitchen",
    text: "Wiadomość z formularza kontaktowego.",
    html: generateContactMessageHtml({
      senderEmail: "anna.kowalska@example.com",
      message:
        "Cześć Marta!\n\nNie mogę pobrać ebooka, link nie działa. Pomożesz?\n\nPozdrawiam,\nAnna",
      context: {
        surface: "download",
        status: "paid",
        orderNumber: "CK-2026-0042",
        token: "abc123token",
      },
      adminUrl: "https://www.chaoskitchen.pl/admin/collections/orders/123",
    }),
  }),
  "download-ready": () => ({
    subject: "Twój ebook jest gotowy do pobrania",
    text: "Cześć Anna,\n\nDziękuję za zakup.\nEbook możesz pobrać klikając w poniższy link.",
    html: generateDownloadReadyHtml({
      customerFirstName: "Anna",
      downloadUrl: "https://www.chaoskitchen.pl/download/abc123token",
      expiresLabel: "20 maja 2026, 14:30",
      supportEmail: process.env.EMAIL_TO ?? "marta@chaoskitchen.pl",
    }),
  }),
  "shipment-notification": () => ({
    subject: "Twoja książka jest w drodze",
    text: "Cześć Anna,\n\nTwoja książka jest w drodze.\nNumer przesyłki: 1234567890ABC\n\nDziękujemy!",
    html: generateShipmentNotificationHtml({
      customerFirstName: "Anna",
      tracking: "1234567890ABC",
    }),
  }),
};

const templateId = process.argv[2];
const to = process.argv[3] ?? DEFAULT_TO;

if (!templateId || !TEMPLATES[templateId]) {
  console.error(
    `Unknown template "${templateId}". Available:\n  ${Object.keys(TEMPLATES).join("\n  ")}`,
  );
  process.exit(1);
}

const { subject, text, html } = TEMPLATES[templateId]();

const payload = await getPayload({ config });
await payload.sendEmail({ to, subject, text, html });

console.log(`Sent "${templateId}" email to ${to}`);
process.exit(0);
