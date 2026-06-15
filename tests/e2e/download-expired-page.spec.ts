/**
 * Layer B — the /download/<token> PAGE (not the file route) for an expired token
 * renders the bespoke expired copy.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

test("expired download page shows the 'link nie jest już aktywny' copy", async ({
  page,
}) => {
  const created = db.createOrder({ email: uniqueBuyerEmail("expired-page") });
  const paid = db.flipPaid(created.id);
  db.patchOrder(paid.id, { downloadExpiresAt: "2020-01-01T00:00:00.000Z" });

  await page.goto(`/download/${paid.downloadToken}`);

  await expect(page.getByText("Link nie jest już aktywny.")).toBeVisible();
  await expect(
    page.getByText("Coś nie tak z linkiem lub zamówieniem"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mam problem z zamówieniem" }),
  ).toBeVisible();
  await expect(
    page.getByText("Twoje zamówienie jest gotowe do realizacji"),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Pobierz ebook" })).toHaveCount(0);
});
