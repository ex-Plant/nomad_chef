import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

/**
 * GET /api/test-email?to=you@example.com
 * Verifies SMTP connection, then sends a test email.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json({ error: "Missing ?to= query param" }, { status: 400 });
  }

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transport.verify();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "SMTP connection failed",
        detail: message,
        config: {
          host: process.env.EMAIL_HOST ?? "(not set)",
          user: process.env.EMAIL_USER ?? "(not set)",
          passSet: !!process.env.EMAIL_PASS,
        },
      },
      { status: 500 }
    );
  }

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Nomad Chef — test email",
      text: "If you see this, the SMTP config works.",
    });

    return NextResponse.json({ success: true, to, messageId: info.messageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Send failed", detail: message }, { status: 500 });
  }
}
