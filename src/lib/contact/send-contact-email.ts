"use server";

import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { contactFormSchema } from "@/lib/contact/contact-schema";
import { generateContactMessageHtml } from "@/lib/emails/templates/contact-message";
import { sendEmail } from "@/lib/emails/send";
import type { ContactContextT } from "@/types/contact";

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
    html: generateContactMessageHtml({
      senderEmail: email,
      message,
      context,
      adminUrl: await resolveOrderAdminUrl(context),
    }),
  });
}

// Best-effort deep link to the order this help request is about. Matches the
// order by its number (or download token), mirroring the P24 webhook lookup.
// Returns undefined if there's no order context or the lookup fails — the
// email still sends, just without the button.
async function resolveOrderAdminUrl(
  context?: ContactContextT,
): Promise<string | undefined> {
  if (!context?.orderNumber && !context?.token) return undefined;

  try {
    const payload = await getPayload({ config });
    const where: Where = context.orderNumber
      ? { orderNumber: { equals: context.orderNumber } }
      : { downloadToken: { equals: context.token } };
    const { docs } = await payload.find({
      collection: "orders",
      where,
      limit: 1,
      depth: 0,
    });
    const order = docs[0];
    if (!order) return undefined;
    return `${ENV.SITE_URL}/admin/collections/orders/${order.id}`;
  } catch (err) {
    console.error("[sendContactEmail] failed to resolve order admin URL", err);
    return undefined;
  }
}
