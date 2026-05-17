import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";
import { escapeHtml } from "../escape-html";

type OrderConfirmationArgsT = {
  orderNumber: string;
  productTitle: string;
  productFormat: string;
  quantity: number;
  totalGross: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  invoice?: {
    companyName: string;
    nip: string;
  };
  omitLogo?: boolean;
};

export function generateOrderConfirmationHtml(
  args: OrderConfirmationArgsT,
): string {
  const customerLine = `${escapeHtml(args.customerFirstName)} ${escapeHtml(args.customerLastName)} &lt;${escapeHtml(args.customerEmail)}&gt;`;

  const items: EmailItemT[] = [
    {
      type: "text",
      content: row("Numer zamówienia", escapeHtml(args.orderNumber)),
    },
    {
      type: "text",
      content: row(
        "Produkt",
        `${escapeHtml(args.productTitle)} (${escapeHtml(args.productFormat)})`,
      ),
    },
    { type: "text", content: row("Ilość", String(args.quantity)) },
    {
      type: "text",
      content: row("Kwota", `${formatAmount(args.totalGross)} PLN`),
    },
    { type: "text", content: row("Klient", customerLine) },
  ];

  if (args.invoice) {
    items.push({
      type: "text",
      content: row(
        "Faktura",
        `${escapeHtml(args.invoice.companyName)} (NIP ${escapeHtml(args.invoice.nip)})`,
      ),
    });
  }

  return renderEmailShell({
    title: `Nowe zamówienie ${args.orderNumber}`,
    items,
    omitLogo: args.omitLogo,
  });
}

function row(label: string, value: string): string {
  return `<strong>${label}:</strong> ${value}`;
}

function formatAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
