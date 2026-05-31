"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { newsletterEmailSchema } from "@/lib/newsletter/newsletter-schema";

type SubscribeResultT = { ok: true } | { ok: false; error: string };

export async function subscribeToNewsletter(
  rawEmail: unknown,
): Promise<SubscribeResultT> {
  const parsed = newsletterEmailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: "Nieprawidłowy adres e-mail" };
  }

  const email = parsed.data;
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "newsletter-subscribers",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.totalDocs > 0) return { ok: true };

  try {
    await payload.create({
      collection: "newsletter-subscribers",
      data: { email },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Nie udało się zapisać. Spróbuj ponownie." };
  }
}
