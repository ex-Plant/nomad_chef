/* Contracts for the orders admin endpoints, shared between each endpoint and the
   admin UI component that calls it so the response shape has one source of truth.
   Each response is a discriminated union: a success member vs OrderApiErrorT. */

// Canonical error body returned by every orders endpoint on a non-2xx response.
export type OrderApiErrorT = {
  readonly error: string;
};

/* POST /api/orders/:id/regenerate-download — discriminated on `token` vs `error`. */
export type RegenerateDownloadSuccessT = {
  readonly ok: true;
  readonly token: string;
  readonly expiresAt: string;
  readonly downloadUrl: string;
  readonly customerEmail: string | null;
  readonly customerFirstName: string | null;
};

export type RegenerateDownloadErrorT = OrderApiErrorT;

export type RegenerateDownloadResponseT =
  | RegenerateDownloadSuccessT
  | OrderApiErrorT;

/* POST /api/orders/:id/send-shipment-notification — discriminated on `sentTo` vs
   `error`. The endpoint sends the shipment email directly via Resend. */
export type SendShipmentNotificationSuccessT = {
  readonly ok: true;
  readonly sentTo: string;
  readonly shippedAt: string;
};

export type SendShipmentNotificationResponseT =
  | SendShipmentNotificationSuccessT
  | OrderApiErrorT;
