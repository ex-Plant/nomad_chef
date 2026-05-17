import type { Endpoint } from "payload";
import {
  generateDownloadToken,
  nextDownloadExpiry,
} from "@/lib/orders/download-token";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";

export const regenerateDownloadEndpoint: Endpoint = {
  path: "/:id/regenerate-download",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.routeParams?.id;
    if (typeof id !== "string" && typeof id !== "number") {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = req.json ? await req.json() : {};
    const sendEmail = Boolean((body as { sendEmail?: unknown }).sendEmail);

    const order = await req.payload
      .findByID({ collection: "orders", id, depth: 1, req })
      .catch(() => null);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const product = typeof order.product === "object" ? order.product : null;
    if (!product || product.format !== "digital") {
      return Response.json(
        { error: "Order is not a digital product." },
        { status: 400 },
      );
    }
    if (order.paymentStatus !== "paid") {
      return Response.json(
        { error: "Order is not paid yet." },
        { status: 400 },
      );
    }

    const token = generateDownloadToken();
    const expiresAt = nextDownloadExpiry();

    await req.payload.update({
      collection: "orders",
      id: order.id,
      data: {
        downloadToken: token,
        downloadExpiresAt: expiresAt.toISOString(),
      },
      context: { skipFulfillment: true },
      req,
    });

    if (sendEmail) {
      const customer =
        typeof order.customer === "object" ? order.customer : null;
      if (!customer?.email) {
        return Response.json(
          {
            error:
              "Token rotated but customer has no email — please send manually.",
            token,
            expiresAt: expiresAt.toISOString(),
          },
          { status: 207 },
        );
      }
      await sendDownloadEmail({
        customerEmail: customer.email,
        customerFirstName: customer.firstName,
        downloadToken: token,
        downloadExpiresAt: expiresAt,
      });
    }

    return Response.json({
      ok: true,
      token,
      expiresAt: expiresAt.toISOString(),
      emailed: sendEmail,
    });
  },
};
