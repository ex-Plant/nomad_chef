"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact-schema";

type SendEmailArgsT = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
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

type SendContactEmailResultT =
  | { success: true }
  | { success: false; error: string };

export async function sendContactEmail(
  input: unknown
): Promise<SendContactEmailResultT> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Nieprawidłowe dane formularza" };
  }

  const { email, message } = parsed.data;

  try {
    await sendEmail({
      to: ENV.EMAIL_TO,
      replyTo: email,
      subject: `Wiadomość z formularza kontaktowego chaoskitchen`,
      text: [
        "",
        `Wiadomość:`,
        message.trim() ? message : "(brak wiadomości)",
        `E-mail nadawcy: ${email}`,
      ].join("\n"),
    });
    return { success: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Send failed:", detail);
    return { success: false, error: "Nie udało się wysłać wiadomości" };
  }
}
