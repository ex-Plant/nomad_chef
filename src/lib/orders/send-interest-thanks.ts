import { sendEmail } from "@/lib/emails/send";
import { generateEbookInterestThanksHtml } from "@/lib/emails/templates/ebook-interest-thanks";

const SUBJECT = "Dziękuję za zainteresowanie e-bookiem";

const TEXT_BODY = [
  "Cześć,",
  "",
  "Dzięki za zainteresowanie moim e-bookiem.",
  "Link do pobrania prześlę w osobnej wiadomości jak tylko otrzymam potwierdzenie wpłaty.",
  "",
  "Marta",
].join("\n");

type SendArgsT = {
  customerEmail: string;
};

export async function sendInterestThanks({
  customerEmail,
}: SendArgsT): Promise<void> {
  try {
    await sendEmail({
      to: customerEmail,
      subject: SUBJECT,
      text: TEXT_BODY,
      html: generateEbookInterestThanksHtml(),
    });
  } catch (err) {
    console.error("[createOrder] interest-thanks email failed", err);
  }
}
