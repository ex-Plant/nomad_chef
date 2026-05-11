"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getLogoUrl } from "@/lib/emails/constants";
import { generateOrderConfirmationHtml } from "@/lib/emails/templates/order-confirmation";
import { generateContactMessageHtml } from "@/lib/emails/templates/contact-message";
import { generateEbookInterestThanksHtml } from "@/lib/emails/templates/ebook-interest-thanks";

const ORDER_FIXTURE = {
  orderNumber: "CK-2026-0042",
  productTitle: "Ebook: Smaki z plecaka",
  productFormat: "digital",
  quantity: 1,
  totalGross: 79,
  customerFirstName: "Anna",
  customerLastName: "Kowalska",
  customerEmail: "anna.kowalska@example.com",
  invoice: {
    companyName: "Kowalska Studio Sp. z o.o.",
    nip: "1234567890",
  },
};

const CONTACT_FIXTURE = {
  senderEmail: "anna.kowalska@example.com",
  message:
    "Cześć Marta!\n\nChciałabym zapytać o możliwość zamówienia kolacji na 12 osób w okolicach Krakowa w czerwcu. Daj znać czy macie wolny termin.\n\nPozdrawiam,\nAnna",
};

type TemplateT = {
  id: string;
  name: string;
  generate: (opts: { omitLogo: boolean }) => string;
};

const TEMPLATES: readonly TemplateT[] = [
  {
    id: "ebook-interest-thanks",
    name: "Ebook Interest — Thanks (pre-launch)",
    generate: ({ omitLogo }) => generateEbookInterestThanksHtml({ omitLogo }),
  },
  {
    id: "order-confirmation",
    name: "Order Confirmation (post-launch)",
    generate: ({ omitLogo }) =>
      generateOrderConfirmationHtml({ ...ORDER_FIXTURE, omitLogo }),
  },
  {
    id: "contact-message",
    name: "Contact Form Message",
    generate: ({ omitLogo }) =>
      generateContactMessageHtml({ ...CONTACT_FIXTURE, omitLogo }),
  },
];

export default function EmailPreviewsPage() {
  // Static guard: in production builds `process.env.NODE_ENV` is inlined to
  // "production", so this page returns 404 unconditionally outside dev.
  if (process.env.NODE_ENV !== "development") notFound();

  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0].id);
  // null = probing (no logo shown yet to avoid flashing broken image),
  // true  = logo URL loaded OK,
  // false = logo URL failed (omit from generated HTML).
  const [logoLoaded, setLogoLoaded] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new Image();
    let cancelled = false;
    img.onload = () => {
      if (!cancelled) setLogoLoaded(true);
    };
    img.onerror = () => {
      if (!cancelled) setLogoLoaded(false);
    };
    img.src = getLogoUrl();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];
  const html = selected.generate({ omitLogo: !logoLoaded });

  return (
    <div className="flex h-dvh flex-col bg-zinc-100">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-zinc-900">Email Previews</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(html);
            }}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Copy HTML
          </button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden p-6">
        <iframe
          title={`${selected.name} preview`}
          srcDoc={html}
          className="h-full w-full rounded-lg border border-zinc-200 bg-white shadow-sm"
        />
      </main>
    </div>
  );
}
