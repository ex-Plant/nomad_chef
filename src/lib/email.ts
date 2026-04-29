"use server";

import nodemailer from "nodemailer";
import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact-schema";

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

  if (!ENV.EMAIL_HOST || !ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
    console.error("[email] Missing SMTP credentials");
    return { success: false, error: "Wysyłka e-maili nie jest skonfigurowana" };
  }

  const { email, message } = parsed.data;

  const transport = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: ENV.EMAIL_USER, pass: ENV.EMAIL_PASS },
  });

  try {
    await transport.sendMail({
      from: ENV.EMAIL_USER,
      to: ENV.EMAIL_TO ?? ENV.EMAIL_USER,
      replyTo: email,
      subject: `Wiadomość ze strony: ${email}`,
      text: [
        `E-mail: ${email}`,
        "",
        `Wiadomość:`,
        message.trim() ? message : "(brak wiadomości)",
      ].join("\n"),
    });
    return { success: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Send failed:", detail);
    return { success: false, error: "Nie udało się wysłać wiadomości" };
  }
}
