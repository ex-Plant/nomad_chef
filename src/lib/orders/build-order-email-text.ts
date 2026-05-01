import type { CartFormValuesT } from "@/lib/cart-schema";

type OrderForEmailT = {
  orderNumber: string;
  quantity: number;
  totalGross: number;
};

type ProductForEmailT = {
  title: string;
  format: string;
};

export function buildOrderEmailText(
  values: CartFormValuesT,
  order: OrderForEmailT,
  product: ProductForEmailT,
) {
  return [
    `Zamówienie: ${order.orderNumber}`,
    `Produkt: ${product.title} (${product.format})`,
    `Ilość: ${order.quantity}`,
    `Kwota: ${order.totalGross} PLN`,
    `Klient: ${values.firstName} ${values.lastName} <${values.email}>`,
    values.wantsInvoice
      ? `Faktura: ${values.companyName} (NIP ${values.nip})`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
