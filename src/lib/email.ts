"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact-schema";
import { generateContactMessageHtml } from "@/lib/emails/templates/contact-message";

type SendEmailArgsT = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type ContactContextT = {
  surface: "download" | "checkout";
  status?: string;
  token?: string;
  orderNumber?: string;
};

export async function sendEmail(args: SendEmailArgsT): Promise<void> {
  const payload = await getPayload({ config });
  await payload.sendEmail({
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
  });
}

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
