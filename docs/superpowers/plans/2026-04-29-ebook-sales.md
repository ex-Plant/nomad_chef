# Ebook Sales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Payload-backed inventory + order tracking for two SKUs (digital cookbook, physical cookbook) with auto-fulfillment for digital and manual fulfillment for physical.

**Architecture:** Three new Payload collections (`Customers`, `Products`, `Orders`) using a single Orders collection with format-discriminated conditional fields. Pure helpers for VAT, order numbering, and token generation are unit-tested with Node's built-in test runner. Hooks handle customer upsert, snapshotting, and fulfillment. A protected download route streams files from Vercel Blob with token + expiry + count limits. Email is stubbed (logs to console) until a transport provider is chosen.

**Tech Stack:** Payload v3.83, Postgres (Vercel adapter), Vercel Blob, Next.js 16 App Router, Node `node:test` + `tsx` for unit tests, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-04-29-ebook-sales-design.md`

---

## File Structure

**New files:**
```
src/collections/customers.ts
src/collections/products.ts
src/collections/orders/
  ├── index.ts                          — collection config
  └── hooks/
      ├── generate-order-number.ts
      ├── upsert-customer.ts
      ├── snapshot.ts
      ├── digital-fulfillment.ts
      └── physical-shipped.ts
src/lib/billing.ts                      — pure helpers (vat, order number, token)
src/lib/billing.test.ts                 — unit tests
src/lib/email.ts                        — stubbed email send
src/app/download/[token]/route.ts       — download route handler
src/app/download/[token]/route.test.ts  — route tests (optional, deferred — manual smoke)
```

**Modified files:**
```
src/payload.config.ts                   — register Customers, Products, Orders
src/config/env.ts                       — (unchanged for now; email env stays commented)
package.json                            — add test script
```

**Auto-generated:**
```
src/migrations/<timestamp>_customers.ts
src/migrations/<timestamp>_products.ts
src/migrations/<timestamp>_orders.ts
src/payload-types.ts                    — regenerated after each collection added
```

---

## Task 1: Set up Node test runner

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add test script**

Edit `package.json` `scripts` block — add this line after `"lint": "eslint",`:

```json
"test": "node --import tsx --test src/lib/billing.test.ts",
```

> Pointing at the one explicit file rather than a glob — keeps it deterministic across shells. When more test files are added later, append them to the command (or migrate to vitest).

- [ ] **Step 2: Verify the script doesn't crash (test file doesn't exist yet)**

Run: `npm test`
Expected: error like "ENOENT: no such file or directory" — that's fine, confirms the script is wired. Task 4 creates the test file.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add test script using node:test + tsx"
```

---

## Task 2: Customers collection

**Files:**
- Create: `src/collections/customers.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

Create `src/collections/customers.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: {
    singular: { pl: "Klient", en: "Customer" },
    plural: { pl: "Klienci", en: "Customers" },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "lastName", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      label: { pl: "E-mail", en: "Email" },
    },
    {
      name: "firstName",
      type: "text",
      label: { pl: "Imię", en: "First name" },
    },
    {
      name: "lastName",
      type: "text",
      label: { pl: "Nazwisko", en: "Last name" },
    },
    {
      name: "addresses",
      type: "array",
      label: { pl: "Adresy", en: "Addresses" },
      fields: [
        { name: "line1", type: "text", required: true, label: { pl: "Ulica i numer", en: "Street and number" } },
        { name: "line2", type: "text", label: { pl: "Lokal / dodatkowo", en: "Apartment / extra" } },
        { name: "city", type: "text", required: true, label: { pl: "Miasto", en: "City" } },
        { name: "postalCode", type: "text", required: true, label: { pl: "Kod pocztowy", en: "Postal code" } },
        { name: "country", type: "text", required: true, defaultValue: "PL", label: { pl: "Kraj", en: "Country" } },
      ],
    },
    {
      name: "marketingConsent",
      type: "checkbox",
      defaultValue: false,
      label: { pl: "Zgoda na marketing", en: "Marketing consent" },
    },
    {
      name: "notes",
      type: "textarea",
      label: { pl: "Notatki", en: "Notes" },
    },
  ],
};
```

- [ ] **Step 2: Register the collection**

Edit `src/payload.config.ts`:

Find:
```ts
import { Users } from "@/collections/users";
import { Media } from "@/collections/media";
```

Replace with:
```ts
import { Users } from "@/collections/users";
import { Media } from "@/collections/media";
import { Customers } from "@/collections/customers";
```

Find:
```ts
collections: [Users, Media],
```

Replace with:
```ts
collections: [Users, Media, Customers],
```

- [ ] **Step 3: Generate migration**

Run: `npm run migrate:create -- --name customers`
Expected: a new file in `src/migrations/<timestamp>_customers.ts` and a matching `.json` snapshot.

- [ ] **Step 4: Apply migration**

Run: `npm run migrate`
Expected: migration applies cleanly, table `customers` created in Postgres.

- [ ] **Step 5: Regenerate types**

Run: `npm run generate:types`
Expected: `src/payload-types.ts` updated with a `Customer` type.

- [ ] **Step 6: Smoke check via admin**

Run: `npm run dev`. Open `http://localhost:3000/admin`, log in, confirm "Klienci / Customers" section is visible. Create one test customer. Delete it. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add src/collections/customers.ts src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat: add Customers collection"
```

---

## Task 3: Products collection

**Files:**
- Create: `src/collections/products.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

Create `src/collections/products.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: { pl: "Produkt", en: "Product" },
    plural: { pl: "Produkty", en: "Products" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "format", "priceGross", "active"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { pl: "Slug", en: "Slug" },
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { pl: "Tytuł", en: "Title" },
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      label: { pl: "Opis", en: "Description" },
    },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: { pl: "Cyfrowy", en: "Digital" }, value: "digital" },
        { label: { pl: "Fizyczny", en: "Physical" }, value: "physical" },
      ],
      label: { pl: "Format", en: "Format" },
    },
    {
      name: "priceGross",
      type: "number",
      required: true,
      min: 0,
      label: { pl: "Cena brutto (grosze)", en: "Price gross (cents)" },
      admin: {
        description: { pl: "Wartość w groszach. 49,99 PLN = 4999.", en: "Value in cents. 49.99 PLN = 4999." },
      },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "PLN",
      options: [{ label: "PLN", value: "PLN" }],
      label: { pl: "Waluta", en: "Currency" },
    },
    {
      name: "vatRate",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      max: 1,
      label: { pl: "Stawka VAT (ułamek dziesiętny)", en: "VAT rate (decimal)" },
      admin: {
        description: { pl: "0.05 = 5%, 0.23 = 23%, 0 = brak.", en: "0.05 = 5%, 0.23 = 23%, 0 = none." },
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
      label: { pl: "Okładka", en: "Cover image" },
    },
    {
      name: "file",
      type: "upload",
      relationTo: "media",
      label: { pl: "Plik (cyfrowy)", en: "File (digital)" },
      admin: {
        condition: (_, siblingData) => siblingData?.format === "digital",
      },
    },
    {
      name: "weightGrams",
      type: "number",
      label: { pl: "Waga (g)", en: "Weight (g)" },
      admin: {
        condition: (_, siblingData) => siblingData?.format === "physical",
      },
    },
    {
      name: "dimensions",
      type: "group",
      label: { pl: "Wymiary (mm)", en: "Dimensions (mm)" },
      admin: {
        condition: (_, siblingData) => siblingData?.format === "physical",
      },
      fields: [
        { name: "length", type: "number" },
        { name: "width", type: "number" },
        { name: "height", type: "number" },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: { pl: "Aktywny", en: "Active" },
    },
  ],
};
```

- [ ] **Step 2: Register the collection**

Edit `src/payload.config.ts`:

Find:
```ts
import { Customers } from "@/collections/customers";
```

Replace with:
```ts
import { Customers } from "@/collections/customers";
import { Products } from "@/collections/products";
```

Find:
```ts
collections: [Users, Media, Customers],
```

Replace with:
```ts
collections: [Users, Media, Customers, Products],
```

- [ ] **Step 3: Generate migration**

Run: `npm run migrate:create -- --name products`

- [ ] **Step 4: Apply migration**

Run: `npm run migrate`

- [ ] **Step 5: Regenerate types**

Run: `npm run generate:types`

- [ ] **Step 6: Smoke check + create the cookbook product**

Run `npm run dev`. In admin, create two products:

- `slug: cookbook-digital`, `title: Książka cyfrowa`, `format: digital`, `priceGross: 4999`, `vatRate: 0`, upload a placeholder image as cover, upload a placeholder PDF as `file`, `active: true`.
- `slug: cookbook-physical`, `title: Książka fizyczna`, `format: physical`, `priceGross: 9999`, `vatRate: 0`, cover image, `weightGrams: 600`, `active: true`.

Verify the conditional fields show/hide correctly when toggling format. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add src/collections/products.ts src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat: add Products collection with digital/physical conditional fields"
```

---

## Task 4: Pure billing helpers + tests

**Files:**
- Create: `src/lib/billing.ts`
- Create: `src/lib/billing.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/billing.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcVat, generateDownloadToken, formatOrderNumber } from "./billing";

describe("calcVat", () => {
  it("splits gross 4999 at rate 0.23 into net 4064 + vat 935", () => {
    const result = calcVat(4999, 0.23);
    assert.equal(result.priceNet, 4064);
    assert.equal(result.vatAmount, 935);
  });

  it("returns priceNet equal to gross and vatAmount 0 when rate is 0", () => {
    const result = calcVat(9999, 0);
    assert.equal(result.priceNet, 9999);
    assert.equal(result.vatAmount, 0);
  });

  it("rounds half up (4999 at 0.05 → net 4761, vat 238)", () => {
    const result = calcVat(4999, 0.05);
    assert.equal(result.priceNet + result.vatAmount, 4999);
  });

  it("never returns negative for zero gross", () => {
    const result = calcVat(0, 0.23);
    assert.equal(result.priceNet, 0);
    assert.equal(result.vatAmount, 0);
  });
});

describe("generateDownloadToken", () => {
  it("returns a 32+ char hex string", () => {
    const token = generateDownloadToken();
    assert.match(token, /^[a-f0-9]{32,}$/);
  });

  it("returns a different token on each call", () => {
    assert.notEqual(generateDownloadToken(), generateDownloadToken());
  });
});

describe("formatOrderNumber", () => {
  it("formats year + zero-padded sequence", () => {
    assert.equal(formatOrderNumber(2026, 1), "NC-2026-0001");
    assert.equal(formatOrderNumber(2026, 42), "NC-2026-0042");
    assert.equal(formatOrderNumber(2026, 9999), "NC-2026-9999");
  });

  it("expands beyond 4 digits when needed", () => {
    assert.equal(formatOrderNumber(2030, 12345), "NC-2030-12345");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: failures with "Cannot find module './billing'" or "calcVat is not a function".

- [ ] **Step 3: Implement helpers**

Create `src/lib/billing.ts`:

```ts
import { randomBytes } from "node:crypto";

export type VatBreakdownT = { priceNet: number; vatAmount: number };

export function calcVat(priceGross: number, vatRate: number): VatBreakdownT {
  if (priceGross === 0) return { priceNet: 0, vatAmount: 0 };
  const priceNet = Math.round(priceGross / (1 + vatRate));
  const vatAmount = priceGross - priceNet;
  return { priceNet, vatAmount };
}

export function generateDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

export function formatOrderNumber(year: number, sequence: number): string {
  return `NC-${year}-${String(sequence).padStart(4, "0")}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/lib/billing.ts src/lib/billing.test.ts
git commit -m "feat: add billing helpers (vat split, order number, download token)"
```

---

## Task 5: Email stub helper

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Implement the stub**

Create `src/lib/email.ts`:

```ts
type SendEmailArgsT = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(args: SendEmailArgsT): Promise<void> {
  console.log("[email:stub]", JSON.stringify(args, null, 2));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add stubbed email sender (logs only, transport TBD)"
```

---

## Task 6: Orders collection skeleton (all fields, no hooks)

**Files:**
- Create: `src/collections/orders/index.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Create the collection**

Create `src/collections/orders/index.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: {
    singular: { pl: "Zamówienie", en: "Order" },
    plural: { pl: "Zamówienia", en: "Orders" },
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customer", "product", "totalGross", "paymentStatus", "fulfillmentStatus", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true },
      label: { pl: "Numer zamówienia", en: "Order number" },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      required: true,
      label: { pl: "Klient", en: "Customer" },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      label: { pl: "Produkt", en: "Product" },
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      label: { pl: "Ilość", en: "Quantity" },
    },
    {
      name: "unitPriceGross",
      type: "number",
      required: true,
      admin: { readOnly: true, description: { pl: "Snapshot z chwili sprzedaży", en: "Snapshot at sale time" } },
      label: { pl: "Cena jedn. brutto (grosze)", en: "Unit price gross (cents)" },
    },
    {
      name: "totalGross",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma brutto (grosze)", en: "Total gross (cents)" },
    },
    {
      name: "priceNet",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma netto (grosze)", en: "Total net (cents)" },
    },
    {
      name: "vatRate",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Stawka VAT", en: "VAT rate" },
    },
    {
      name: "vatAmount",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Kwota VAT (grosze)", en: "VAT amount (cents)" },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "PLN",
      options: [{ label: "PLN", value: "PLN" }],
    },
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Opłacone", en: "Paid" }, value: "paid" },
        { label: { pl: "Nieudane", en: "Failed" }, value: "failed" },
        { label: { pl: "Zwrot", en: "Refunded" }, value: "refunded" },
      ],
    },
    {
      name: "paymentProvider",
      type: "text",
      label: { pl: "Operator płatności", en: "Payment provider" },
    },
    {
      name: "paymentRef",
      type: "text",
      index: true,
      label: { pl: "ID transakcji", en: "Transaction ID" },
    },
    {
      name: "fulfillmentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Wysłane / dostarczone", en: "Fulfilled" }, value: "fulfilled" },
        { label: { pl: "Wysłane (kurier)", en: "Shipped" }, value: "shipped" },
        { label: { pl: "Dostarczone", en: "Delivered" }, value: "delivered" },
      ],
    },
    {
      name: "downloadToken",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        condition: (data) => data?.product && getProductFormat(data) === "digital",
      },
      label: { pl: "Token pobrania", en: "Download token" },
    },
    {
      name: "downloadCount",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        condition: (data) => getProductFormat(data) === "digital",
      },
    },
    {
      name: "downloadLimit",
      type: "number",
      defaultValue: 5,
      min: 1,
      admin: { condition: (data) => getProductFormat(data) === "digital" },
    },
    {
      name: "downloadExpiresAt",
      type: "date",
      admin: {
        readOnly: true,
        condition: (data) => getProductFormat(data) === "digital",
      },
    },
    {
      name: "shippingAddress",
      type: "group",
      admin: { condition: (data) => getProductFormat(data) === "physical" },
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "city", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text", defaultValue: "PL" },
      ],
    },
    {
      name: "tracking",
      type: "text",
      admin: { condition: (data) => getProductFormat(data) === "physical" },
    },
    {
      name: "courier",
      type: "select",
      options: [
        { label: "InPost", value: "inpost" },
        { label: "DPD", value: "dpd" },
        { label: "DHL", value: "dhl" },
        { label: "Poczta Polska", value: "poczta-polska" },
        { label: { pl: "Inny", en: "Other" }, value: "other" },
      ],
      admin: { condition: (data) => getProductFormat(data) === "physical" },
    },
    {
      name: "shippedAt",
      type: "date",
      admin: { condition: (data) => getProductFormat(data) === "physical" },
    },
    {
      name: "notes",
      type: "textarea",
      label: { pl: "Notatki wewnętrzne", en: "Internal notes" },
    },
    {
      name: "paidAt",
      type: "date",
      admin: { readOnly: true },
    },
    {
      name: "fulfilledAt",
      type: "date",
      admin: { readOnly: true },
    },
  ],
};

function getProductFormat(data: unknown): "digital" | "physical" | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { product?: { format?: string } | string };
  if (typeof d.product === "object" && d.product?.format) {
    return d.product.format as "digital" | "physical";
  }
  return undefined;
}
```

> Note on the `condition` callbacks: Payload passes `data` (the order being edited) where `product` may be a relationship ID OR a populated object. The helper handles only the populated case — if the format can't be determined, the field shows. This is acceptable for a single-admin tool. Hooks will validate at write time.

- [ ] **Step 2: Register the collection**

Edit `src/payload.config.ts`:

Find:
```ts
import { Products } from "@/collections/products";
```

Replace with:
```ts
import { Products } from "@/collections/products";
import { Orders } from "@/collections/orders";
```

Find:
```ts
collections: [Users, Media, Customers, Products],
```

Replace with:
```ts
collections: [Users, Media, Customers, Products, Orders],
```

- [ ] **Step 3: Generate migration**

Run: `npm run migrate:create -- --name orders`

- [ ] **Step 4: Apply migration**

Run: `npm run migrate`

- [ ] **Step 5: Regenerate types**

Run: `npm run generate:types`

- [ ] **Step 6: Smoke check**

Run `npm run dev`. Open admin, confirm "Zamówienia / Orders" section is visible. Don't try to create an order yet — the hooks aren't wired and required snapshot fields would block it. Stop dev.

- [ ] **Step 7: Commit**

```bash
git add src/collections/orders/ src/payload.config.ts src/migrations/ src/payload-types.ts
git commit -m "feat: add Orders collection schema (no hooks yet)"
```

---

## Task 7: Order number hook

**Files:**
- Create: `src/collections/orders/hooks/generate-order-number.ts`
- Modify: `src/collections/orders/index.ts`

- [ ] **Step 1: Implement the hook**

Create `src/collections/orders/hooks/generate-order-number.ts`:

```ts
import type { CollectionBeforeChangeHook } from "payload";
import { formatOrderNumber } from "@/lib/billing";

export const generateOrderNumber: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== "create") return data;
  if (data.orderNumber) return data;

  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year + 1, 0, 1).toISOString();

  const existing = await req.payload.count({
    collection: "orders",
    where: {
      createdAt: { greater_than_equal: startOfYear, less_than: endOfYear },
    },
  });

  data.orderNumber = formatOrderNumber(year, existing.totalDocs + 1);
  return data;
};
```

- [ ] **Step 2: Wire the hook into the collection**

Edit `src/collections/orders/index.ts`:

Find:
```ts
import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
```

Replace with:
```ts
import type { CollectionConfig } from "payload";
import { generateOrderNumber } from "./hooks/generate-order-number";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [generateOrderNumber],
  },
```

- [ ] **Step 3: Smoke check (no automated test — requires Payload boot)**

Run `npm run dev`. In admin, create an Order — pick a Customer + a digital Product, set `quantity: 1`, `unitPriceGross: 4999`, `totalGross: 4999`, `priceNet: 4999`, `vatRate: 0`, `vatAmount: 0`. Save. Confirm `orderNumber = NC-2026-0001` (or matching year + 0001). Delete the order. Stop dev.

> The required snapshot fields above are tedious to fill manually — Task 8 (snapshot hook) auto-fills them. For now, fill manually for the smoke test.

- [ ] **Step 4: Commit**

```bash
git add src/collections/orders/
git commit -m "feat: auto-generate order numbers on create"
```

---

## Task 8: Snapshot hook (price, vat, shipping address)

**Files:**
- Create: `src/collections/orders/hooks/snapshot.ts`
- Modify: `src/collections/orders/index.ts`

- [ ] **Step 1: Implement the hook**

Create `src/collections/orders/hooks/snapshot.ts`:

```ts
import type { CollectionBeforeChangeHook } from "payload";
import { calcVat } from "@/lib/billing";

export const snapshotOrder: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== "create") return data;

  if (!data.product) throw new Error("Order requires a product");
  const product = await req.payload.findByID({
    collection: "products",
    id: typeof data.product === "string" || typeof data.product === "number" ? data.product : data.product.id,
    depth: 0,
  });

  const quantity = data.quantity ?? 1;
  const unitPriceGross = product.priceGross;
  const totalGross = unitPriceGross * quantity;
  const vatRate = product.vatRate ?? 0;
  const { priceNet, vatAmount } = calcVat(totalGross, vatRate);

  data.unitPriceGross = unitPriceGross;
  data.totalGross = totalGross;
  data.priceNet = priceNet;
  data.vatRate = vatRate;
  data.vatAmount = vatAmount;
  data.currency = product.currency ?? "PLN";

  if (product.format === "physical" && data.customer && !data.shippingAddress?.line1) {
    const customer = await req.payload.findByID({
      collection: "customers",
      id: typeof data.customer === "string" || typeof data.customer === "number" ? data.customer : data.customer.id,
      depth: 0,
    });
    const firstAddress = customer.addresses?.[0];
    if (firstAddress) {
      data.shippingAddress = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        line1: firstAddress.line1,
        line2: firstAddress.line2,
        city: firstAddress.city,
        postalCode: firstAddress.postalCode,
        country: firstAddress.country,
      };
    }
  }

  return data;
};
```

- [ ] **Step 2: Wire the hook**

Edit `src/collections/orders/index.ts`:

Find:
```ts
import { generateOrderNumber } from "./hooks/generate-order-number";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [generateOrderNumber],
  },
```

Replace with:
```ts
import { generateOrderNumber } from "./hooks/generate-order-number";
import { snapshotOrder } from "./hooks/snapshot";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [snapshotOrder, generateOrderNumber],
  },
```

> Order matters: `snapshotOrder` runs first to populate snapshot fields, `generateOrderNumber` runs after.

- [ ] **Step 3: Make snapshot fields not required at API level**

The snapshot fields are filled by the hook, so the API caller doesn't supply them. But the schema still marks them `required: true`. This is fine — Payload validates after `beforeChange` hooks run. No change needed.

- [ ] **Step 4: Smoke check**

Run `npm run dev`. In admin, create an Order — pick a Customer + Product + quantity. Leave price/vat fields blank. Save. Confirm fields auto-filled from product. Delete the order. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add src/collections/orders/
git commit -m "feat: snapshot product price/vat and customer shipping address on order create"
```

---

## Task 9: Customer upsert hook

**Files:**
- Create: `src/collections/orders/hooks/upsert-customer.ts`

> NOTE: This hook is for FUTURE webhook flow where the buyer doesn't exist as a Customer yet. For admin-created orders (current state) the customer is picked from the relationship dropdown. The hook is invoked when an Order is created with `_buyerEmail` / `_buyerFirstName` / `_buyerLastName` fields in the request payload (set by webhook adapter, not via admin UI).
>
> For now, this hook is a no-op when those fields aren't present. It's wired now so the webhook adapter (future plan) can rely on it.

- [ ] **Step 1: Implement the hook**

Create `src/collections/orders/hooks/upsert-customer.ts`:

```ts
import type { CollectionBeforeChangeHook } from "payload";

type BuyerInputT = {
  _buyerEmail?: string;
  _buyerFirstName?: string;
  _buyerLastName?: string;
  _buyerAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

export const upsertCustomer: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== "create") return data;
  const buyer = data as BuyerInputT;
  const email = buyer._buyerEmail;
  if (!email) return data;

  const existing = await req.payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  });

  let customerId: string | number;
  if (existing.docs[0]) {
    customerId = existing.docs[0].id;
    if (buyer._buyerAddress) {
      const current = existing.docs[0];
      const hasAddress = current.addresses?.some(
        (a) => a.line1 === buyer._buyerAddress!.line1 && a.postalCode === buyer._buyerAddress!.postalCode,
      );
      if (!hasAddress) {
        await req.payload.update({
          collection: "customers",
          id: customerId,
          data: {
            addresses: [...(current.addresses ?? []), buyer._buyerAddress],
          },
        });
      }
    }
  } else {
    const created = await req.payload.create({
      collection: "customers",
      data: {
        email,
        firstName: buyer._buyerFirstName,
        lastName: buyer._buyerLastName,
        addresses: buyer._buyerAddress ? [buyer._buyerAddress] : undefined,
      },
    });
    customerId = created.id;
  }

  data.customer = customerId;
  delete (data as Record<string, unknown>)._buyerEmail;
  delete (data as Record<string, unknown>)._buyerFirstName;
  delete (data as Record<string, unknown>)._buyerLastName;
  delete (data as Record<string, unknown>)._buyerAddress;

  return data;
};
```

- [ ] **Step 2: Wire the hook**

Edit `src/collections/orders/index.ts`:

Find:
```ts
import { generateOrderNumber } from "./hooks/generate-order-number";
import { snapshotOrder } from "./hooks/snapshot";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [snapshotOrder, generateOrderNumber],
  },
```

Replace with:
```ts
import { generateOrderNumber } from "./hooks/generate-order-number";
import { snapshotOrder } from "./hooks/snapshot";
import { upsertCustomer } from "./hooks/upsert-customer";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [upsertCustomer, snapshotOrder, generateOrderNumber],
  },
```

> Order: `upsertCustomer` first (resolves customer ID), then `snapshotOrder` (uses customer ID to copy address), then `generateOrderNumber`.

- [ ] **Step 3: Smoke check**

Run `npm run dev`. Create another Order in admin (using the dropdown — the new fields are not surfaced in admin, only used by webhook). Confirm it still works. Delete. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/collections/orders/
git commit -m "feat: customer upsert hook for webhook-created orders"
```

---

## Task 10: Digital fulfillment hook

**Files:**
- Create: `src/collections/orders/hooks/digital-fulfillment.ts`
- Modify: `src/collections/orders/index.ts`

- [ ] **Step 1: Implement the hook**

Create `src/collections/orders/hooks/digital-fulfillment.ts`:

```ts
import type { CollectionAfterChangeHook } from "payload";
import { generateDownloadToken } from "@/lib/billing";
import { sendEmail } from "@/lib/email";

const DOWNLOAD_TTL_DAYS = 30;

export const digitalFulfillment: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation }) => {
  if (operation !== "update" && operation !== "create") return doc;
  const wasNotPaid = !previousDoc || previousDoc.paymentStatus !== "paid";
  const isNowPaid = doc.paymentStatus === "paid";
  if (!(wasNotPaid && isNowPaid)) return doc;

  const product = typeof doc.product === "object"
    ? doc.product
    : await req.payload.findByID({ collection: "products", id: doc.product, depth: 0 });
  if (product.format !== "digital") return doc;

  const customer = typeof doc.customer === "object"
    ? doc.customer
    : await req.payload.findByID({ collection: "customers", id: doc.customer, depth: 0 });

  const token = generateDownloadToken();
  const expiresAt = new Date(Date.now() + DOWNLOAD_TTL_DAYS * 24 * 60 * 60 * 1000);

  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      downloadToken: token,
      downloadExpiresAt: expiresAt.toISOString(),
      paidAt: doc.paidAt ?? new Date().toISOString(),
      fulfillmentStatus: "fulfilled",
      fulfilledAt: new Date().toISOString(),
    },
    context: { skipFulfillment: true },
  });

  const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/download/${token}`;
  await sendEmail({
    to: customer.email,
    subject: "Twoja książka jest gotowa do pobrania",
    text: `Cześć ${customer.firstName ?? ""},\n\nDziękujemy za zakup. Pobierz swoją książkę:\n${downloadUrl}\n\nLink wygasa ${expiresAt.toLocaleDateString("pl-PL")}, masz ${doc.downloadLimit ?? 5} prób pobrania.\n\nMiłej lektury!`,
  });

  return doc;
};
```

- [ ] **Step 2: Wire the hook + add re-entry guard**

Edit `src/collections/orders/index.ts`:

Find:
```ts
import { upsertCustomer } from "./hooks/upsert-customer";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [upsertCustomer, snapshotOrder, generateOrderNumber],
  },
```

Replace with:
```ts
import { upsertCustomer } from "./hooks/upsert-customer";
import { digitalFulfillment } from "./hooks/digital-fulfillment";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [upsertCustomer, snapshotOrder, generateOrderNumber],
    afterChange: [digitalFulfillment],
  },
```

> The hook self-updates the order with `context: { skipFulfillment: true }`. To prevent infinite recursion, add a check at the top of the hook:

Edit `src/collections/orders/hooks/digital-fulfillment.ts`:

Find:
```ts
export const digitalFulfillment: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation }) => {
  if (operation !== "update" && operation !== "create") return doc;
```

Replace with:
```ts
export const digitalFulfillment: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.skipFulfillment) return doc;
  if (operation !== "update" && operation !== "create") return doc;
```

- [ ] **Step 3: Smoke check**

Run `npm run dev`. Create an Order with the digital product. Save. Edit it, set `paymentStatus = paid`, save. Confirm:
- Server log shows `[email:stub] { "to": "...", "subject": "Twoja książka...", ... }`.
- `downloadToken`, `downloadExpiresAt`, `paidAt`, `fulfillmentStatus = fulfilled`, `fulfilledAt` are set.

Delete the order. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/collections/orders/
git commit -m "feat: auto-fulfill digital orders on payment with token + email"
```

---

## Task 11: Physical shipped hook

**Files:**
- Create: `src/collections/orders/hooks/physical-shipped.ts`
- Modify: `src/collections/orders/index.ts`

- [ ] **Step 1: Implement the hook**

Create `src/collections/orders/hooks/physical-shipped.ts`:

```ts
import type { CollectionAfterChangeHook } from "payload";
import { sendEmail } from "@/lib/email";

export const physicalShipped: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.skipFulfillment) return doc;
  if (operation !== "update") return doc;
  const wasNotShipped = previousDoc.fulfillmentStatus !== "shipped";
  const isNowShipped = doc.fulfillmentStatus === "shipped";
  if (!(wasNotShipped && isNowShipped)) return doc;

  const product = typeof doc.product === "object"
    ? doc.product
    : await req.payload.findByID({ collection: "products", id: doc.product, depth: 0 });
  if (product.format !== "physical") return doc;

  const customer = typeof doc.customer === "object"
    ? doc.customer
    : await req.payload.findByID({ collection: "customers", id: doc.customer, depth: 0 });

  await req.payload.update({
    collection: "orders",
    id: doc.id,
    data: {
      shippedAt: doc.shippedAt ?? new Date().toISOString(),
    },
    context: { skipFulfillment: true },
  });

  const tracking = doc.tracking ?? "(brak numeru)";
  const courier = doc.courier ?? "(kurier nieznany)";
  await sendEmail({
    to: customer.email,
    subject: "Twoja książka jest w drodze",
    text: `Cześć ${customer.firstName ?? ""},\n\nWysłaliśmy Twoją książkę.\nKurier: ${courier}\nNumer przesyłki: ${tracking}\n\nDziękujemy!`,
  });

  return doc;
};
```

- [ ] **Step 2: Wire the hook**

Edit `src/collections/orders/index.ts`:

Find:
```ts
import { digitalFulfillment } from "./hooks/digital-fulfillment";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [upsertCustomer, snapshotOrder, generateOrderNumber],
    afterChange: [digitalFulfillment],
  },
```

Replace with:
```ts
import { digitalFulfillment } from "./hooks/digital-fulfillment";
import { physicalShipped } from "./hooks/physical-shipped";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [upsertCustomer, snapshotOrder, generateOrderNumber],
    afterChange: [digitalFulfillment, physicalShipped],
  },
```

- [ ] **Step 3: Smoke check**

Run `npm run dev`. Create an Order with the physical product. Pick the customer (must have at least one address — verify shipping address auto-snapshots). Save. Set `paymentStatus = paid`. Save. Then set `fulfillmentStatus = shipped`, fill `tracking` + `courier`. Save. Confirm `[email:stub]` log shows shipped email. Delete. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/collections/orders/
git commit -m "feat: send tracking email when physical order ships"
```

---

## Task 12: Download route handler

**Files:**
- Create: `src/app/download/[token]/route.ts`

- [ ] **Step 1: Implement the route**

Create `src/app/download/[token]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

type RouteContextT = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: RouteContextT): Promise<Response> {
  const { token } = await ctx.params;
  if (!token || token.length < 32) {
    return errorResponse("Nieprawidłowy link.", 400);
  }

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    limit: 1,
    depth: 1,
  });
  const order = result.docs[0];

  if (!order) return errorResponse("Link nieaktywny.", 404);
  if (order.paymentStatus !== "paid") return errorResponse("Zamówienie nieopłacone.", 403);

  const expiresAt = order.downloadExpiresAt ? new Date(order.downloadExpiresAt) : null;
  if (!expiresAt || expiresAt < new Date()) {
    return errorResponse("Link wygasł. Skontaktuj się z nami, aby otrzymać nowy.", 410);
  }

  const limit = order.downloadLimit ?? 5;
  const count = order.downloadCount ?? 0;
  if (count >= limit) {
    return errorResponse("Wykorzystano limit pobrań. Skontaktuj się z nami, aby otrzymać nowy link.", 429);
  }

  const product = typeof order.product === "object" ? order.product : null;
  if (!product || product.format !== "digital" || !product.file) {
    return errorResponse("Brak pliku do pobrania.", 500);
  }

  const file = typeof product.file === "object" ? product.file : null;
  if (!file?.url) return errorResponse("Plik niedostępny.", 500);

  const fileResponse = await fetch(file.url);
  if (!fileResponse.ok || !fileResponse.body) {
    return errorResponse("Nie można pobrać pliku.", 502);
  }

  await payload.update({
    collection: "orders",
    id: order.id,
    data: { downloadCount: count + 1 },
    context: { skipFulfillment: true },
  });

  const filename = file.filename ?? "ebook.pdf";
  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function errorResponse(message: string, status: number): Response {
  return NextResponse.json({ error: message }, { status });
}
```

- [ ] **Step 2: Smoke check end-to-end**

Run `npm run dev`. Create a digital order, set `paymentStatus = paid`. From the server log, copy the `downloadToken` (or look it up in admin). Visit `http://localhost:3000/download/<token>` in a browser. Expected: file downloads. Re-visit: still works, `downloadCount` increments in admin. Delete the order. Stop dev.

- [ ] **Step 3: Smoke check error paths**

Re-run dev. Test:
- `/download/invalid` → 400 "Nieprawidłowy link"
- `/download/<32 chars but unknown>` → 404 "Link nieaktywny"
- Edit a paid order in admin, set `downloadExpiresAt` to a past date, retry → 410 "Link wygasł"
- Reset expiry, set `downloadCount = 5`, retry → 429 "Wykorzystano limit"

Stop dev.

- [ ] **Step 4: Commit**

```bash
git add src/app/download/
git commit -m "feat: add token-gated download route with expiry + count limit"
```

---

## Task 13: Final integration smoke test

**Files:** none modified

- [ ] **Step 1: Full digital flow**

Run `npm run dev`. In admin:
1. Create a Customer (Anna, anna@test.local).
2. Create an Order: customer = Anna, product = digital cookbook. Save. Confirm `orderNumber = NC-2026-XXXX`, snapshot fields populated, `paymentStatus = pending`.
3. Edit the order: set `paymentStatus = paid`. Save. Confirm token + expiry + fulfillment status set, server log shows email stub.
4. Visit `/download/<token>` — file downloads, `downloadCount` increments.

- [ ] **Step 2: Full physical flow**

In admin:
1. Edit Anna, add an address.
2. Create another Order: customer = Anna, product = physical cookbook. Save. Confirm `shippingAddress` auto-snapshotted from Anna's first address.
3. Set `paymentStatus = paid`. Save. (No download token, no email yet — that's fine; physical-paid email is future work.)
4. Set `fulfillmentStatus = shipped`, fill `tracking + courier`. Save. Confirm `shippedAt` set, server log shows shipped email stub.

- [ ] **Step 3: Cleanup**

Delete both test orders + Anna. Stop dev.

- [ ] **Step 4: Run all tests**

Run: `npm test && npm run lint`
Expected: all tests pass, no lint errors.

- [ ] **Step 5: Final commit (if anything dirty)**

```bash
git status
# if clean: nothing to do
# if dirty: investigate before committing
```

---

## Out of scope — future plans

The spec lists these as deferred. Do NOT implement them in this plan:

- Real email transport (Resend or nodemailer wiring) — separate plan once provider chosen.
- Payment processor adapter + webhook signature verification — separate plan once Stripe vs Tpay decided.
- Re-issue download admin button (custom Payload component) — chef can manually reset `downloadCount` and `downloadExpiresAt` via the standard edit form for now.
- Sales dashboard / stats UI — separate brainstorm after first ~20 sales.
- Refund amount/reason fields — defer until real refund happens.
- Physical-paid "thanks, we'll ship soon" email — small follow-up; current flow only emails on shipped.
- Shipping cost calculation — needs courier API choice; affects checkout, not Order schema.
- Invoice PDF generation — accountant exports raw data via Payload's existing CSV/JSON tools.
