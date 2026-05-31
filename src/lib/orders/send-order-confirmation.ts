import type { Product } from "@/payload-types";
import { ENV } from "@/config/env";
import { sendEmail } from "@/lib/emails/send";
import type { CartFormValuesT } from "@/lib/cart/cart-schema";
import { generateOrderConfirmationHtml } from "@/lib/emails/templates/order-confirmation";
import { buildOrderEmailText } from "./build-order-email-text";
import type { PersistedOrderT } from "./persist-customer-and-order";

type SendArgsT = {
  order: PersistedOrderT;
  values: CartFormValuesT;
  product: Product;
  emailTo: string;
};

// Operator-only "new order" notification. Fire-and-forget: a failure here just
// logs, because the order is already visible in the admin panel — there's
// nothing for the operator to recover. The customer-critical email (the
// download link) is tracked per-order via downloadEmailStatus; see
// digital-fulfillment.ts.
export async function sendOrderConfirmation({
  order,
  values,
  product,
  emailTo,
}: SendArgsT): Promise<void> {
  try {
    await sendEmail({
      to: emailTo,
      subject: `Nowe zamówienie ${order.orderNumber}`,
      text: buildOrderEmailText(values, order, product),
      html: generateOrderConfirmationHtml({
        orderNumber: order.orderNumber,
        productTitle: product.title,
        productFormat: product.format,
        quantity: order.quantity,
        totalGross: order.totalGross,
        customerFirstName: values.firstName,
        customerLastName: values.lastName,
        customerEmail: values.email,
        invoice: values.wantsInvoice
          ? { companyName: values.companyName, nip: values.nip }
          : undefined,
        adminUrl: `${ENV.SITE_URL}/admin/collections/orders/${order.id}`,
      }),
    });
  } catch (err) {
    console.error("[createOrder] operator notification email failed", err);
  }
}
