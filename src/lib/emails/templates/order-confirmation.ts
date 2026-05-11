import { renderEmailShell } from "../render-shell";
import type { EmailItemT } from "../constants";

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
  const items: EmailItemT[] = [
    { type: "text", content: row("Numer zamówienia", args.orderNumber) },
    {
      type: "text",
      content: row("Produkt", `${args.productTitle} (${args.productFormat})`),
    },
    { type: "text", content: row("Ilość", String(args.quantity)) },
    {
      type: "text",
      content: row("Kwota", `${formatAmount(args.totalGross)} PLN`),
    },
    {
      type: "text",
      content: row(
        "Klient",
        `${args.customerFirstName} ${args.customerLastName} &lt;${args.customerEmail}&gt;`,
      ),
    },
  ];

  if (args.invoice) {
    items.push({
      type: "text",
      content: row(
        "Faktura",
        `${args.invoice.companyName} (NIP ${args.invoice.nip})`,
      ),
    });
  }

  return renderEmailShell({
    title: `Nowe zamówienie ${args.orderNumber}`,
    items,
    footer: "Zespół Chaos Kitchen",
    omitLogo: args.omitLogo,
  });
}

function row(label: string, value: string): string {
  return `<strong>${label}:</strong> ${value}`;
}

function formatAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
