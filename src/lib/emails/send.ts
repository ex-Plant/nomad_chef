"use server";

import { getPayload } from "payload";
import config from "@payload-config";

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
