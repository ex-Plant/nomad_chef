# Digital Fulfillment & Download Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A paid digital buyer is reliably redirected to their download instead of stranding on the `Płatność zaksięgowana` screen, with token generation decoupled from (and ordered before) the email and both partial-failure states recoverable.

**Architecture:** Extract a single idempotent fulfillment core (`fulfillDigitalOrder`) plus a token-only helper (`ensureDownloadToken`) that persists the token **write-once** (set-if-null + read-back) so concurrent callers converge on one canonical token. The hook delegates to the core; the processing page heals a missing token inline and redirects on `paid` + digital; the daily cron retries failed/unsent emails only.

**Tech Stack:** Next.js (App Router, `force-dynamic`), Payload CMS (Local API, afterChange hooks, Postgres/Drizzle), Playwright E2E via the `db-cli` Local-API harness, `node --test` for pure units.

**Spec:** `docs/superpowers/specs/2026-06-15-digital-fulfillment-handoff-design.md`

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/orders/fulfill-digital-order.ts` | **new** — `ensureDownloadToken` (write-once token) + `fulfillDigitalOrder` (token-first, idempotent, email-decoupled) |
| `src/collections/orders/hooks/digital-fulfillment.ts` | reduced to: detect `pending→paid` digital transition → delegate to `fulfillDigitalOrder` |
| `src/app/(site)/checkout/processing/page.tsx` | redirect on `paid` + digital via `ensureDownloadToken` |
| `src/app/(site)/checkout/processing/processing-status.tsx` | `paid`-state copy + button label |
| `src/app/(site)/download/[token]/download-card.tsx` | bespoke `expired` copy/layout |
| `src/app/api/cron/reconcile-payments/route.ts` | second sweep: retry failed/unsent download emails (state B) |
| `tests/e2e/helpers/db-cli.ts` | add `ensure-token`, `fulfill-order`, `email-retry-sweep` commands |
| `tests/e2e/fulfillment-core.spec.ts` | **new** — core token-first / write-once / idempotency / email-retry E2E |
| `tests/e2e/download-expired-page.spec.ts` | **new** — expired download page renders the new copy |

---

## Task 1: Fulfillment core — `ensureDownloadToken` + `fulfillDigitalOrder`

**Files:**
- Create: `src/lib/orders/fulfill-digital-order.ts`
- Modify: `tests/e2e/helpers/db-cli.ts` (add `ensure-token`, `fulfill-order`)
- Test: `tests/e2e/fulfillment-core.spec.ts`

- [ ] **Step 1: Create the core module**

Create `src/lib/orders/fulfill-digital-order.ts`:

```ts
import type { Payload, PayloadRequest } from "payload";
import {
  generateDownloadToken,
  nextDownloadExpiry,
} from "@/lib/orders/download-token";
import { sendDownloadEmail } from "@/lib/orders/send-download-email";
import { EMAIL_STATUS, type EmailStatusT } from "@/lib/orders/email-status";
import { asPopulated } from "@/lib/payload/as-populated";
import type { Customer, Order, Product } from "@/payload-types";

type FulfillArgsT = {
  readonly payload: Payload;
  readonly order: Order;
  // Present only on the hook path (carries the active transaction). Page/cron
  // callers use a fresh getPayload with no ambient transaction.
  readonly req?: PayloadRequest;
};

const reqOpt = (req?: PayloadRequest) => (req ? { req } : {});

async function resolveProduct(
  { payload, order, req }: FulfillArgsT,
): Promise<Product | null> {
  const populated = asPopulated<Product>(order.product);
  if (populated) return populated;
  if (typeof order.product !== "number") return null;
  return payload.findByID({
    collection: "products",
    id: order.product,
    depth: 0,
    ...reqOpt(req),
  });
}

async function resolveCustomer(
  { payload, order, req }: FulfillArgsT,
): Promise<Customer | null> {
  const populated = asPopulated<Customer>(order.customer);
  if (populated) return populated;
  if (typeof order.customer !== "number") return null;
  return payload.findByID({
    collection: "customers",
    id: order.customer,
    depth: 0,
    ...reqOpt(req),
  });
}

// Persist the download token WRITE-ONCE: the update only matches while the
// column is still null, so a concurrent writer (P24 return race: webhook hook vs
// the buyer's processing render) can't overwrite a token another path already
// issued. We then re-read and return whatever token is actually stored — ours if
// we won, the racer's if they did — so every caller converges on one canonical
// value. Returns the canonical token.
export async function ensureDownloadToken(args: FulfillArgsT): Promise<string> {
  const { payload, order, req } = args;
  if (order.downloadToken) return order.downloadToken;

  const candidate = generateDownloadToken();
  const expiresAt = nextDownloadExpiry();
  await payload.update({
    collection: "orders",
    where: {
      and: [
        { id: { equals: order.id } },
        { downloadToken: { exists: false } },
      ],
    },
    data: {
      downloadToken: candidate,
      downloadExpiresAt: expiresAt.toISOString(),
      paidAt: order.paidAt ?? new Date().toISOString(),
    },
    context: { skipFulfillment: true },
    ...reqOpt(req),
  });

  const fresh = await payload.findByID({
    collection: "orders",
    id: order.id,
    depth: 0,
    ...reqOpt(req),
  });
  if (!fresh.downloadToken) {
    throw new Error(
      `[fulfillDigitalOrder] token missing after write for order ${order.orderNumber}`,
    );
  }
  return fresh.downloadToken;
}

// Idempotent fulfillment for a PAID DIGITAL order. Token first (write-once),
// then — only if not already sent — the download email. A failed email never
// unsets the token. Safe to call from the afterChange hook, the processing-page
// redirect, and the cron retry sweep. No-op for non-paid / non-digital orders.
export async function fulfillDigitalOrder(
  args: FulfillArgsT,
): Promise<{ token: string | null }> {
  const { payload, order, req } = args;
  if (order.paymentStatus !== "paid") return { token: null };

  const product = await resolveProduct(args);
  if (product?.format !== "digital") return { token: null };

  const token = await ensureDownloadToken(args);

  if (order.downloadEmailStatus === EMAIL_STATUS.sent) {
    return { token };
  }

  // Re-read to get the persisted expiry alongside the canonical token.
  const fresh = await payload.findByID({
    collection: "orders",
    id: order.id,
    depth: 0,
    ...reqOpt(req),
  });
  const customer = await resolveCustomer({ ...args, order: fresh });
  const expiresAt = fresh.downloadExpiresAt
    ? new Date(fresh.downloadExpiresAt)
    : nextDownloadExpiry();

  let emailStatus: EmailStatusT = EMAIL_STATUS.sent;
  let emailError: string | null = null;
  try {
    await sendDownloadEmail({
      customerEmail: customer?.email ?? "",
      customerFirstName: customer?.firstName,
      downloadToken: token,
      downloadExpiresAt: expiresAt,
    });
  } catch (err) {
    console.error("[fulfillDigitalOrder] download email failed", err);
    emailStatus = EMAIL_STATUS.failed;
    emailError = err instanceof Error ? err.message : String(err);
  }

  const sent = emailStatus === EMAIL_STATUS.sent;
  const now = new Date().toISOString();
  await payload.update({
    collection: "orders",
    id: order.id,
    data: {
      fulfillmentStatus: sent ? "fulfilled" : fresh.fulfillmentStatus,
      fulfilledAt: sent ? now : fresh.fulfilledAt,
      downloadEmailStatus: emailStatus,
      downloadEmailSentAt: sent ? now : null,
      downloadEmailError: emailError,
    },
    context: { skipFulfillment: true },
    ...reqOpt(req),
  });

  return { token };
}
```

- [ ] **Step 2: Add `ensure-token` and `fulfill-order` commands to the db-cli**

In `tests/e2e/helpers/db-cli.ts`, add an import near the top (after the existing imports):

```ts
import {
  ensureDownloadToken,
  fulfillDigitalOrder,
} from "../../../src/lib/orders/fulfill-digital-order";
```

Add two cases to the `switch (cmd)` block (before `default:`):

```ts
  case "ensure-token": {
    const id = Number(str(flags.id));
    if (!id) throw new Error("ensure-token requires --id");
    const order = await payload.findByID({ collection: "orders", id, depth: 0 });
    const token = await ensureDownloadToken({ payload, order });
    out({ token, order: await getOrder(id) });
    break;
  }

  case "fulfill-order": {
    const id = Number(str(flags.id));
    if (!id) throw new Error("fulfill-order requires --id");
    const order = await payload.findByID({ collection: "orders", id, depth: 0 });
    const result = await fulfillDigitalOrder({ payload, order });
    out({ ...result, order: await getOrder(id) });
    break;
  }
```

- [ ] **Step 3: Add the db helpers to the fixture**

In `tests/e2e/fixtures/db.ts`, add to the `db` object (after `getOrder`):

```ts
  ensureToken(id: number): { token: string; order: OrderRowT } {
    return run<{ token: string; order: OrderRowT }>([
      "ensure-token",
      "--id",
      String(id),
    ]);
  },
  fulfillOrder(id: number): { token: string | null; order: OrderRowT } {
    return run<{ token: string | null; order: OrderRowT }>([
      "fulfill-order",
      "--id",
      String(id),
    ]);
  },
```

- [ ] **Step 4: Write the failing E2E spec**

Create `tests/e2e/fulfillment-core.spec.ts`:

```ts
/**
 * Layer B — the shared fulfillment core. Exercises ensureDownloadToken (write-
 * once) and fulfillDigitalOrder (idempotent, token-first) via the Local-API
 * db-cli, independent of the hook trigger.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

const TOKEN_REGEX = /^[0-9a-f]{48}$/;

test("ensureToken issues a token for a paid order that has none", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-ensure") });
  // patch to paid WITHOUT firing the hook, so there is genuinely no token yet
  db.patchOrder(created.id, { paymentStatus: "paid" });

  const { token, order } = db.ensureToken(created.id);
  expect(token).toMatch(TOKEN_REGEX);
  expect(order.downloadToken).toBe(token);
  expect(order.downloadExpiresAt).toBeTruthy();
});

test("ensureToken is write-once: a second call returns the same token", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-once") });
  db.patchOrder(created.id, { paymentStatus: "paid" });

  const first = db.ensureToken(created.id);
  const second = db.ensureToken(created.id);
  expect(second.token).toBe(first.token);
});

test("fulfillOrder is idempotent and never regenerates an existing token", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-fulfill") });
  const paid = db.flipPaid(created.id); // hook already fulfilled it
  expect(paid.downloadToken).toMatch(TOKEN_REGEX);

  const again = db.fulfillOrder(created.id);
  expect(again.token).toBe(paid.downloadToken);
  expect(again.order.downloadToken).toBe(paid.downloadToken);
  expect(again.order.downloadEmailStatus).toBe("sent");
});

test("fulfillOrder no-ops on a pending order", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-pending") });
  const result = db.fulfillOrder(created.id);
  expect(result.token).toBeNull();
  expect(result.order.downloadToken ?? null).toBeNull();
});
```

- [ ] **Step 5: Run the spec to verify it fails**

Run: `npx playwright test fulfillment-core`
Expected: FAIL — `ensure-token`/`fulfill-order` unknown command (until Steps 1–3 are saved) or assertion failures.

- [ ] **Step 6: Run the spec to verify it passes (after Steps 1–3)**

Run: `npx playwright test fulfillment-core`
Expected: PASS — all four tests green.

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/lib/orders/fulfill-digital-order.ts tests/e2e/helpers/db-cli.ts tests/e2e/fixtures/db.ts tests/e2e/fulfillment-core.spec.ts`
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add src/lib/orders/fulfill-digital-order.ts tests/e2e/helpers/db-cli.ts tests/e2e/fixtures/db.ts tests/e2e/fulfillment-core.spec.ts
git commit -m "add shared digital-fulfillment core with write-once token"
```

---

## Task 2: Hook delegates to the core

**Files:**
- Modify: `src/collections/orders/hooks/digital-fulfillment.ts`
- Test: `tests/e2e/fulfillment-digital.spec.ts` (existing — must still pass)

- [ ] **Step 1: Replace the hook body with delegation**

Rewrite `src/collections/orders/hooks/digital-fulfillment.ts` to:

```ts
/**
 * Fires on every orders write. On the first transition to `paymentStatus: "paid"`
 * for a digital product, delegates to fulfillDigitalOrder (token-first, then the
 * download email). The same core also runs on the processing-page redirect and
 * the cron email-retry sweep, so the three paths can never diverge.
 */

import type { CollectionAfterChangeHook } from "payload";
import { fulfillDigitalOrder } from "@/lib/orders/fulfill-digital-order";

export const digitalFulfillment: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Recursion guard for the core's own updates.
  if (context?.skipFulfillment) return doc;
  if (operation !== "update" && operation !== "create") return doc;

  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  await fulfillDigitalOrder({ payload: req.payload, order: doc, req });
  return doc;
};
```

- [ ] **Step 2: Run the existing fulfillment spec to verify no regression**

Run: `npx playwright test fulfillment-digital`
Expected: PASS — `paying a digital order issues a token and sends the download email` still green (token matches regex, `downloadEmailStatus = sent`, expiry ~72h).

- [ ] **Step 3: Run the physical fulfillment spec (no-op path)**

Run: `npx playwright test fulfillment-physical`
Expected: PASS — a physical paid order still issues no token (the core's `format !== "digital"` guard).

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint src/collections/orders/hooks/digital-fulfillment.ts`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/collections/orders/hooks/digital-fulfillment.ts
git commit -m "delegate digital fulfillment hook to shared core"
```

---

## Task 3: Processing page redirects on paid + digital

**Files:**
- Modify: `src/app/(site)/checkout/processing/page.tsx`

> No automated test: the page reads a signed checkout cookie that an HTTP client can't forge without the signing secret, so an isolated page test would cost more than it's worth. The redirect is a guarded 3-line change over the already-E2E-covered `ensureDownloadToken`; verified manually (Task 7) and by the `[P24-TRACE]` prod logs.

- [ ] **Step 1: Gate the redirect on paid + digital and heal the token inline**

In `src/app/(site)/checkout/processing/page.tsx`, replace the existing paid-redirect block:

```ts
  if (order.paymentStatus === "paid" && order.downloadToken) {
    redirect(`/download/${order.downloadToken}`);
  }
```

with:

```ts
  const product = asPopulated(order.product);
  // Digital paid → ensure a token exists (heals the paid-but-no-token race
  // inline, never via cron) and redirect to the download. The store sells no
  // physical products, so the digital guard is a safety net: a non-digital paid
  // order falls through to the paid screen below and mints no token.
  if (order.paymentStatus === "paid" && product?.format === "digital") {
    const token = await ensureDownloadToken({ payload, order });
    redirect(`/download/${token}`);
  }
```

Add the import at the top (the file already imports `asPopulated`; confirm it does — if not, add it):

```ts
import { ensureDownloadToken } from "@/lib/orders/fulfill-digital-order";
```

(`asPopulated` is already imported as `import { asPopulated } from "@/lib/payload/as-populated";` — reused for `customer` below.)

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/(site)/checkout/processing/page.tsx"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/checkout/processing/page.tsx"
git commit -m "redirect paid digital orders from processing to download"
```

---

## Task 4: Processing-page `paid`-state copy

**Files:**
- Modify: `src/app/(site)/checkout/processing/processing-status.tsx`

- [ ] **Step 1: Update the `paid` body copy**

In `processing-status.tsx`, replace the `paid` paragraph line:

```tsx
          {paymentStatus === "paid" && "Zamówienie zostało opłacone."}
```

with:

```tsx
          {paymentStatus === "paid" &&
            "Za chwilę przekierujemy Cię na stronę pobierania. Jeśli to nie nastąpi, sprawdź swój e-mail lub zgłoś problem poniżej."}
```

- [ ] **Step 2: Make the help button label state-aware**

Replace the help button label `Mam problem z płatnością`:

```tsx
        Mam problem z płatnością
```

with a value derived from status — change the `<Button>` child to:

```tsx
        {paymentStatus === "paid"
          ? "Mam problem z zamówieniem"
          : "Mam problem z płatnością"}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/(site)/checkout/processing/processing-status.tsx"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/checkout/processing/processing-status.tsx"
git commit -m "update paid-state processing copy to redirect fallback"
```

---

## Task 5: Bespoke `expired` download-card copy

**Files:**
- Modify: `src/app/(site)/download/[token]/download-card.tsx`
- Test: `tests/e2e/download-expired-page.spec.ts`

- [ ] **Step 1: Write the failing E2E page test**

Create `tests/e2e/download-expired-page.spec.ts`:

```ts
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
  await expect(page.getByText("Coś nie tak z linkiem lub zamówieniem")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mam problem z zamówieniem" }),
  ).toBeVisible();
  await expect(
    page.getByText("Twoje zamówienie jest gotowe do realizacji"),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Pobierz ebook" })).toHaveCount(0);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test download-expired-page`
Expected: FAIL — current expired copy is `Link wygasł` / `Linki do pobrania są aktywne…`, so the new text isn't found.

- [ ] **Step 3: Give `expired` its own branch**

In `download-card.tsx`, remove the `expired` entry from `STATUS_COPY` (leave `not_found` and `not_paid`):

```tsx
const STATUS_COPY: Record<
  Exclude<DownloadStatusT, "ready" | "expired">,
  { title: string; body: string; buttonLabel: string }
> = {
  not_found: {
    title: "Link nieaktywny",
    body: "Ten link do pobrania jest nieprawidłowy lub został usunięty.",
    buttonLabel: "Mam problem z pobraniem",
  },
  not_paid: {
    title: "Zamówienie jeszcze się przetwarza",
    body: "Płatność nie została jeszcze potwierdzona. Wrócimy do Ciebie e-mailem, gdy będzie gotowe.",
    buttonLabel: "Mam problem z pobraniem",
  },
};
```

Then add a dedicated `expired` render branch directly above the existing `if (status !== "ready")` block:

```tsx
  if (status === "expired") {
    return (
      <>
        <Card>
          <TestNotice />
          <Paragraph>Link nie jest już aktywny.</Paragraph>
          <div className="border-off-black/15 flex flex-col gap-6 border-t pt-6">
            <Paragraph>
              Coś nie tak z linkiem lub zamówieniem? Napisz do mnie.
            </Paragraph>
            <Button
              type="button"
              variant="coral-solid"
              size="compact"
              onClick={() => setIsHelpOpen(true)}
            >
              Mam problem z zamówieniem
            </Button>
          </div>
        </Card>
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          context={helpContext}
          prefillEmail={customerEmail ?? undefined}
        />
      </>
    );
  }
```

(The subsequent `if (status !== "ready")` block now only handles `not_found` / `not_paid`; its `STATUS_COPY[status]` access is type-correct because `expired` is excluded above.)

- [ ] **Step 4: Run the page test to verify it passes**

Run: `npx playwright test download-expired-page`
Expected: PASS.

- [ ] **Step 5: Run the file-route gating spec for no regression**

Run: `npx playwright test download-gating`
Expected: PASS — the 410 file-route branch is unchanged (this task only touched the page card).

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/(site)/download/[token]/download-card.tsx" tests/e2e/download-expired-page.spec.ts`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(site)/download/[token]/download-card.tsx" tests/e2e/download-expired-page.spec.ts
git commit -m "give expired download page its own minimal copy"
```

---

## Task 6: Cron retries failed/unsent download emails (state B)

**Files:**
- Modify: `src/app/api/cron/reconcile-payments/route.ts`
- Modify: `tests/e2e/helpers/db-cli.ts` (add `email-retry-sweep`)
- Modify: `tests/e2e/fixtures/db.ts` (add `emailRetrySweep`)
- Test: `tests/e2e/fulfillment-core.spec.ts` (extend)

- [ ] **Step 1: Add the email-retry sweep to the cron route**

In `src/app/api/cron/reconcile-payments/route.ts`, add the import:

```ts
import { fulfillDigitalOrder } from "@/lib/orders/fulfill-digital-order";
```

After the existing pending-reconciliation loop and its `console.log`, add a second sweep (before the debug-ping block):

```ts
  // Second sweep: paid orders whose download email never sent (state B). The
  // token is healed inline on the processing page (state A), so this is about
  // delivery, not tokens — though fulfillDigitalOrder's write-once step will
  // still issue a token if one is somehow missing before it emails.
  const emailRetry = { resent: 0, errored: 0 };
  const unsent = await payload.find({
    collection: "orders",
    where: {
      and: [
        { paymentStatus: { equals: "paid" } },
        { downloadEmailStatus: { not_equals: "sent" } },
      ],
    },
    depth: 0,
    limit: MAX_ORDERS_PER_RUN,
    sort: "createdAt",
  });
  for (const order of unsent.docs) {
    try {
      await fulfillDigitalOrder({ payload, order });
      emailRetry.resent += 1;
    } catch (err) {
      emailRetry.errored += 1;
      console.error(
        `[p24:reconcile] order ${order.orderNumber} email retry failed`,
        err,
      );
    }
  }
  console.log(`[p24:reconcile] download-email retry sweep`, emailRetry);
```

Add `emailRetry` to the final JSON response:

```ts
  return NextResponse.json({
    checked: result.docs.length,
    ...counts,
    leftover,
    emailRetry,
  });
```

- [ ] **Step 2: Add an `email-retry-sweep` command to the db-cli**

In `tests/e2e/helpers/db-cli.ts`, add a case (the sweep logic mirrors the route, so the test drives the real selection + core):

```ts
  case "email-retry-sweep": {
    const unsent = await payload.find({
      collection: "orders",
      where: {
        and: [
          { paymentStatus: { equals: "paid" } },
          { downloadEmailStatus: { not_equals: "sent" } },
        ],
      },
      depth: 0,
      limit: 100,
      sort: "createdAt",
    });
    let resent = 0;
    for (const order of unsent.docs) {
      await fulfillDigitalOrder({ payload, order });
      resent += 1;
    }
    out({ swept: unsent.docs.length, resent });
    break;
  }
```

- [ ] **Step 3: Add the fixture helper**

In `tests/e2e/fixtures/db.ts`, add to the `db` object:

```ts
  emailRetrySweep(): { swept: number; resent: number } {
    return run<{ swept: number; resent: number }>(["email-retry-sweep"]);
  },
```

- [ ] **Step 4: Extend the core spec with a retry test**

Append to `tests/e2e/fulfillment-core.spec.ts`:

```ts
test("email-retry sweep resends a paid order whose email is not sent", () => {
  const created = db.createOrder({ email: uniqueBuyerEmail("core-retry") });
  const paid = db.flipPaid(created.id);
  // Simulate a failed/unsent email while keeping the token (state B).
  db.patchOrder(paid.id, { downloadEmailStatus: "failed" });

  const sweep = db.emailRetrySweep();
  expect(sweep.resent).toBeGreaterThanOrEqual(1);

  const after = db.getOrder(paid.id);
  expect(after.downloadEmailStatus).toBe("sent");
  expect(after.downloadToken).toBe(paid.downloadToken); // token unchanged
});
```

> Note: `patch-order` in db-cli does not currently set `downloadEmailStatus`. Add it: in the `patch-order` case, alongside the existing `if (str(flags.downloadToken)) …` lines, add
> `if (str(flags.downloadEmailStatus)) data.downloadEmailStatus = str(flags.downloadEmailStatus);`

- [ ] **Step 5: Run the extended spec to verify it passes**

Run: `npx playwright test fulfillment-core`
Expected: PASS — including the new retry test.

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint "src/app/api/cron/reconcile-payments/route.ts" tests/e2e/helpers/db-cli.ts tests/e2e/fixtures/db.ts tests/e2e/fulfillment-core.spec.ts`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add "src/app/api/cron/reconcile-payments/route.ts" tests/e2e/helpers/db-cli.ts tests/e2e/fixtures/db.ts tests/e2e/fulfillment-core.spec.ts
git commit -m "add download-email retry sweep to reconcile cron"
```

---

## Task 7: Manual verification (local) + docs

**Files:**
- Modify: `docs/przelewy24.md` (fulfillment-handoff note)

- [ ] **Step 1: Local end-to-end check**

With `npm run dev` + ngrok (per `docs/przelewy24.md` §6), drive a sandbox purchase to `Zapłać`. Confirm: paywall → `/checkout/processing` → **auto-redirect to `/download/<token>`** (no lingering on `Płatność zaksięgowana`), and the `[P24-TRACE]` logs show `register OK` → `webhook IN` → `flipped pending→paid`.

- [ ] **Step 2: Update the P24 doc**

In `docs/przelewy24.md`, in the §1 architecture/return-race area, add a short paragraph documenting: the processing page now redirects on `paid` + digital via `ensureDownloadToken` (inline token heal, write-once), and the reconcile cron retries failed/unsent download emails. Keep it factual and brief; do not restate code.

- [ ] **Step 3: Commit**

```bash
git add docs/przelewy24.md
git commit -m "document fulfillment handoff + email retry in P24 doc"
```

---

## Notes

- **`[P24-TRACE]` logging** added during diagnosis stays for now (already committed) so the fix can be confirmed in prod. Strip with `grep -rn "P24-TRACE" src` once verified — out of scope for this plan.
- **Out of scope:** the 404 / no-transaction permanent-`pending` gap in `reconcileOrderPayment` (abandoned-paywall orders never resolve to `failed`).
- **Run the full E2E gate** before merge: `npx playwright test` (the default gate excludes the `@manual` live-paywall specs).
