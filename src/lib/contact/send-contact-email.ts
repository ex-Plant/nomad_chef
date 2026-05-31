"use server";

import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact/contact-schema";
import { generateContactMessageHtml } from "@/lib/emails/templates/contact-message";
import { sendEmail } from "@/lib/emails/send";

export type ContactContextT = {
  surface: "download" | "checkout";
  status?: string;
  token?: string;
  orderNumber?: string;
};

export async function sendContactEmail(
  input: unknown,
  context?: ContactContextT,
): Promise<void> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) throw new Error("Nieprawidłowe dane formularza");

  const { email, message } = parsed.data;

  const subject = context
    ? `[Pomoc / ${context.surface}] ${context.orderNumber ?? context.token?.slice(0, 8) ?? "—"}`
    : "Wiadomość z formularza kontaktowego chaoskitchen";

  const contextLines = context
    ? [
        "",
        "—",
        `Surface: ${context.surface}`,
        ...(context.status ? [`Status: ${context.status}`] : []),
        ...(context.orderNumber ? [`Zamówienie: ${context.orderNumber}`] : []),
        ...(context.token ? [`Token: ${context.token}`] : []),
      ]
    : [];

  await sendEmail({
    to: ENV.EMAIL_TO,
    replyTo: email,
    subject,
    text: [
      "",
      "Wiadomość:",
      message.trim() ? message : "(brak wiadomości)",
      `E-mail nadawcy: ${email}`,
      ...contextLines,
    ].join("\n"),
    html: generateContactMessageHtml({ senderEmail: email, message }),
  });
}
