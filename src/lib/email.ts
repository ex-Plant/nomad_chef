"use server";

import nodemailer from "nodemailer";
import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact-schema";

type SendEmailArgsT = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(args: SendEmailArgsT): Promise<void> {
  const transport = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: ENV.EMAIL_USER, pass: ENV.EMAIL_PASS },
  });

  await transport.sendMail({
    from: ENV.EMAIL_USER,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
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

  const transport = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: ENV.EMAIL_USER, pass: ENV.EMAIL_PASS },
  });

  try {
    await transport.sendMail({
      from: ENV.EMAIL_USER,
      to: ENV.EMAIL_TO,
      replyTo: email,
      subject: `Wiadomość z formularza kontaktowego chaoskitchen `,
      text: [
        "",
        `Wiadomość:`,
        message.trim() ? message : "(brak wiadomości)",
        `E-mail nadawcy : ${email}`,
      ].join("\n"),
    });
    return { success: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Send failed:", detail);
    return { success: false, error: "Nie udało się wysłać wiadomości" };
  }
}
