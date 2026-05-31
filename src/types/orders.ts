/* Contract for POST /api/orders/:id/regenerate-download. Shared between the
   endpoint (src/collections/orders/endpoints/regenerate-download.ts) and the
   admin UI (RegenerateDownloadButtons) so the response shape has one source of
   truth. Discriminated on the presence of `token` vs `error`. */

export type RegenerateDownloadSuccessT = {
  readonly ok: true;
  readonly token: string;
  readonly expiresAt: string;
  readonly downloadUrl: string;
  readonly customerEmail: string | null;
  readonly customerFirstName: string | null;
};

export type RegenerateDownloadErrorT = {
  readonly error: string;
};

export type RegenerateDownloadResponseT =
  | RegenerateDownloadSuccessT
  | RegenerateDownloadErrorT;
