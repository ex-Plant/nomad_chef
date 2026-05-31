/**
 * POST /api/orders/:id/regenerate-download — admin-only.
 *
 * Re-issues a digital order's download link: mints a fresh token + 72h expiry
 * and persists them, which invalidates the previous link (downloadToken is
 * unique). Unlike the digitalFulfillment hook — which issues token #1 and emails
 * the customer automatically on the paid transition — this endpoint sends no
 * email; it returns the new link + customer details so the admin UI
 * (RegenerateDownloadButtons) can open a prefilled mailto draft for a manual send.
 *
 * Guards: requires an authenticated user, a digital product, and paymentStatus
 * "paid". The order update sets context.skipFulfillment so the afterChange
 * fulfillment hook doesn't re-fire (no recursion, no duplicate email).
 */

import type { Endpoint } from "payload";
import type {
  RegenerateDownloadErrorT,
  RegenerateDownloadSuccessT,
} from "@/types/orders";
import {
  generateDownloadToken,
  nextDownloadExpiry,
} from "@/lib/orders/download-token";
import { asPopulated } from "@/lib/payload/as-populated";
import { ENV } from "@/config/env";

export const regenerateDownloadEndpoint: Endpoint = {
  path: "/:id/regenerate-download",
  method: "post",
  handler: async (req) => {
    if (!req.user) {
      return Response.json(
        { error: "Unauthorized" } satisfies RegenerateDownloadErrorT,
        { status: 401 },
      );
    }

    const id = req.routeParams?.id;
    if (typeof id !== "string" && typeof id !== "number") {
      return Response.json(
        { error: "Invalid id" } satisfies RegenerateDownloadErrorT,
        { status: 400 },
      );
    }

    const order = await req.payload
      .findByID({ collection: "orders", id, depth: 1, req })
      .catch(() => null);
    if (!order) {
      return Response.json(
        { error: "Order not found" } satisfies RegenerateDownloadErrorT,
        { status: 404 },
      );
    }

    const product = asPopulated(order.product);
    if (!product || product.format !== "digital") {
      return Response.json(
        {
          error: "Order is not a digital product.",
        } satisfies RegenerateDownloadErrorT,
        { status: 400 },
      );
    }
    if (order.paymentStatus !== "paid") {
      return Response.json(
        { error: "Order is not paid yet." } satisfies RegenerateDownloadErrorT,
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

    const customer = asPopulated(order.customer);

    const result: RegenerateDownloadSuccessT = {
      ok: true,
      token,
      expiresAt: expiresAt.toISOString(),
      downloadUrl: `${ENV.SITE_URL}/download/${token}`,
      customerEmail: customer?.email ?? null,
      customerFirstName: customer?.firstName ?? null,
    };
    return Response.json(result);
  },
};
