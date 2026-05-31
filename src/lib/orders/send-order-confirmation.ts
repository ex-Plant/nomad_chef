import type { Payload } from "payload";
import type { Product } from "@/payload-types";
import { ENV } from "@/config/env";
import { sendEmail } from "@/lib/emails/send";
import type { CartFormValuesT } from "@/lib/cart/cart-schema";
import { generateOrderConfirmationHtml } from "@/lib/emails/templates/order-confirmation";
import { buildOrderEmailText } from "./build-order-email-text";
import { EMAIL_STATUS, type EmailStatusT } from "./email-status";
import type { PersistedOrderT } from "./persist-customer-and-order";

type SendArgsT = {
  payload: Payload;
  order: PersistedOrderT;
  values: CartFormValuesT;
  product: Product;
  emailTo: string;
};

export async function sendOrderConfirmation({
  payload,
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
    await updateEmailStatus({
      payload,
      orderId: order.id,
      status: EMAIL_STATUS.sent,
    });
  } catch (err) {
    console.error("[createOrder] confirmation email failed", err);
    const message = err instanceof Error ? err.message : String(err);
    await updateEmailStatus({
      payload,
      orderId: order.id,
      status: EMAIL_STATUS.failed,
      error: message,
    });
  }
}

type UpdateStatusArgsT = {
  payload: Payload;
  orderId: string | number;
  status: EmailStatusT;
  error?: string;
};

async function updateEmailStatus({
  payload,
  orderId,
  status,
  error,
}: UpdateStatusArgsT): Promise<void> {
  const data =
    status === EMAIL_STATUS.sent
      ? {
          confirmationEmailStatus: status,
          confirmationEmailSentAt: new Date().toISOString(),
          confirmationEmailError: null,
        }
      : {
          confirmationEmailStatus: status,
          confirmationEmailError: error ?? null,
        };

  try {
    await payload.update({
      collection: "orders",
      id: orderId,
      data: data as never,
    });
  } catch (updateErr) {
    console.error("[createOrder] failed to mark email status", updateErr);
  }
}
