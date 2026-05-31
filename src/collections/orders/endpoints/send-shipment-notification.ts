/**
 * POST /api/orders/:id/send-shipment-notification — admin-only.
 *
 * Emails the customer that their physical book has shipped. This used to fire
 * automatically from the physicalShipped afterChange hook on the not-shipped →
 * shipped transition; it is now an explicit manual action so the chef controls
 * exactly when the "your book is on the way" email goes out. The admin sets
 * fulfillmentStatus to "shipped" and saves first; this endpoint then sends the
 * email and stamps shippedAt if it is still empty.
 *
 * Guards: authenticated user, a physical product, fulfillmentStatus "shipped",
 * and a non-empty tracking number (the email shows it). Unlike
 * regenerate-download, the send is direct via Resend — the email is templated.
 */

import type { Endpoint } from "payload";
import type {
  OrderApiErrorT,
  SendShipmentNotificationSuccessT,
} from "@/types/orders";
import { sendEmail } from "@/lib/emails/send";
import { generateShipmentNotificationHtml } from "@/lib/emails/templates/shipment-notification";
import { asPopulated } from "@/lib/payload/as-populated";

export const sendShipmentNotificationEndpoint: Endpoint = {
  path: "/:id/send-shipment-notification",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "Unauthorized" } satisfies OrderApiErrorT, {
        status: 401,
      });
    }

    const id = req.routeParams?.id;
    if (typeof id !== "string" && typeof id !== "number") {
      return Response.json({ error: "Invalid id" } satisfies OrderApiErrorT, {
        status: 400,
      });
    }

    const order = await req.payload
      .findByID({ collection: "orders", id, depth: 1, req })
      .catch(() => null);
    if (!order) {
      return Response.json(
        { error: "Order not found" } satisfies OrderApiErrorT,
        { status: 404 },
      );
    }

    const product = asPopulated(order.product);
    if (!product || product.format !== "physical") {
      return Response.json(
        { error: "Order is not a physical product." } satisfies OrderApiErrorT,
        { status: 400 },
      );
    }
    if (order.fulfillmentStatus !== "shipped") {
      return Response.json(
        {
          error: "Ustaw status realizacji na „Wysłane (kurier)” i zapisz.",
        } satisfies OrderApiErrorT,
        { status: 400 },
      );
    }
    const tracking = order.tracking?.trim();
    if (!tracking) {
      return Response.json(
        {
          error: "Uzupełnij numer przesyłki przed wysłaniem powiadomienia.",
        } satisfies OrderApiErrorT,
        { status: 400 },
      );
    }

    const customer = asPopulated(order.customer);
    if (!customer?.email) {
      return Response.json(
        { error: "Brak adresu e-mail klienta." } satisfies OrderApiErrorT,
        { status: 400 },
      );
    }

    const shippedAt = order.shippedAt ?? new Date().toISOString();
    if (!order.shippedAt) {
      await req.payload.update({
        collection: "orders",
        id: order.id,
        data: { shippedAt },
        req,
      });
    }

    const greeting = customer.firstName
      ? `Cześć ${customer.firstName},`
      : "Cześć,";
    await sendEmail({
      to: customer.email,
      subject: "Twoja książka jest w drodze",
      text: `${greeting}\n\nTwoja książka jest w drodze.\nNumer przesyłki: ${tracking}\n\nDziękujemy!`,
      html: generateShipmentNotificationHtml({
        customerFirstName: customer.firstName,
        tracking,
      }),
    });

    const result: SendShipmentNotificationSuccessT = {
      ok: true,
      sentTo: customer.email,
      shippedAt,
    };
    return Response.json(result);
  },
};
