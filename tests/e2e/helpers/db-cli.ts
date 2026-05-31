/**
 * Payload Local-API CLI for the E2E suite. Run via the proven tsx mechanism
 * (mirrors scripts/test-email.ts) so it loads payload.config the same way the
 * app does — Playwright's own TS loader can't boot the Payload config:
 *
 *   node --env-file=.env --import tsx tests/e2e/helpers/db-cli.ts <cmd> [--flags]
 *
 * Every command prints a single JSON object to STDOUT (logs go to STDERR), so
 * the Playwright fixture can parse the result. Commands exercise the REAL hooks
 * — flip-paid fires digitalFulfillment (token + download email), exactly as the
 * P24 webhook / PULL path do (see reconcile-order-payment.ts).
 */
import { getPayload } from "payload";
import config from "../../../src/payload.config";
import { persistCustomerAndOrder } from "../../../src/lib/orders/persist-customer-and-order";
import { defaultCartValues } from "../../../src/lib/cart/cart-schema";

type FlagsT = Record<string, string | true>;

function parseFlags(argv: readonly string[]): FlagsT {
  const flags: FlagsT = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  return flags;
}

function str(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Sentinel-prefixed so the Playwright fixture can pluck the result line out of
// Payload's pino boot logs (which also write JSON to stdout).
const RESULT_PREFIX = "__E2E_RESULT__";
function out(data: unknown): void {
  process.stdout.write(RESULT_PREFIX + JSON.stringify(data) + "\n");
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = parseFlags(rest);

const payload = await getPayload({ config });

async function findCustomerId(email: string): Promise<number> {
  const existing = await payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs[0]) return existing.docs[0].id as number;
  const created = await payload.create({
    collection: "customers",
    data: {
      email,
      firstName: str(flags.firstName) ?? "E2E",
      lastName: str(flags.lastName) ?? "Test",
    },
  });
  return created.id as number;
}

async function getOrder(id: number) {
  return payload.findByID({ collection: "orders", id, depth: 0 });
}

switch (cmd) {
  case "create-order": {
    const email = str(flags.email);
    if (!email) throw new Error("create-order requires --email");
    const format = str(flags.format) === "physical" ? "physical" : "digital";
    const slug =
      format === "physical" ? "cookbook-physical" : "cookbook-digital";

    const products = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const product = products.docs[0];
    if (!product) throw new Error(`Product not found: ${slug}`);

    const customerId = await findCustomerId(email);

    // beforeChange hooks fill orderNumber + price snapshot; the cast mirrors
    // persist-customer-and-order.ts (Payload's create type demands them).
    const data: Record<string, unknown> = {
      product: product.id,
      customer: customerId,
      quantity: 1,
      wantsInvoice: flags.invoice === true || flags.invoice === "true",
    };
    if (format === "physical") {
      data.shippingAddress = {
        firstName: "E2E",
        lastName: "Test",
        line1: "ul. Testowa 1",
        city: "Warszawa",
        postalCode: "00-001",
        country: "PL",
      };
    }

    const order = await payload.create({
      collection: "orders",
      data: data as never,
    });
    out({ ...(await getOrder(order.id)), customerId });
    break;
  }

  case "flip-paid": {
    const id = Number(str(flags.id));
    if (!id) throw new Error("flip-paid requires --id");
    // The real pending→paid flip — mirrors the webhook / reconcile settlement
    // (paymentStatus + paymentRef + paidAt in one update) so it's faithful for
    // physical orders too, where digitalFulfillment doesn't backfill paidAt.
    await payload.update({
      collection: "orders",
      id,
      data: {
        paymentStatus: "paid",
        paymentRef: str(flags.ref) ?? "E2E-REF",
        paidAt: new Date().toISOString(),
      },
    });
    // Re-read: the hook writes token/email status in a nested update.
    out(await getOrder(id));
    break;
  }

  case "patch-order": {
    // Craft order states for gating tests without firing fulfillment.
    const id = Number(str(flags.id));
    if (!id) throw new Error("patch-order requires --id");
    const data: Record<string, unknown> = {};
    if (str(flags.downloadToken)) data.downloadToken = str(flags.downloadToken);
    if (str(flags.downloadExpiresAt))
      data.downloadExpiresAt = str(flags.downloadExpiresAt);
    if (str(flags.paymentStatus)) data.paymentStatus = str(flags.paymentStatus);
    if (str(flags.fulfillmentStatus))
      data.fulfillmentStatus = str(flags.fulfillmentStatus);
    if (str(flags.tracking)) data.tracking = str(flags.tracking);
    await payload.update({
      collection: "orders",
      id,
      data: data as never,
      context: { skipFulfillment: true },
    });
    out(await getOrder(id));
    break;
  }

  case "get-order": {
    const id = Number(str(flags.id));
    if (!id) throw new Error("get-order requires --id");
    const depth = Number(str(flags.depth) ?? "0");
    out(await payload.findByID({ collection: "orders", id, depth }));
    break;
  }

  case "invoice-order": {
    // Drives the REAL capture pipeline (persistCustomerAndOrder →
    // buildAddressesToAdd → findOrCreateCustomer) for a digital + invoice order,
    // so the test audits how invoice + customer data is actually stored.
    const email = str(flags.email);
    if (!email) throw new Error("invoice-order requires --email");
    const products = await payload.find({
      collection: "products",
      where: { slug: { equals: "cookbook-digital" } },
      limit: 1,
      depth: 0,
    });
    const product = products.docs[0];
    if (!product) throw new Error("cookbook-digital not found");

    const values = {
      ...defaultCartValues("digital", "cookbook-digital"),
      email,
      firstName: str(flags.firstName) ?? "E2E",
      lastName: str(flags.lastName) ?? "Invoice",
      wantsInvoice: true,
      companyName: str(flags.companyName) ?? "Testowa Sp. z o.o.",
      nip: str(flags.nip) ?? "1234567890",
      invoiceLine1: str(flags.invoiceLine1) ?? "ul. Fakturowa 5",
      invoiceCity: str(flags.invoiceCity) ?? "Krakow",
      invoicePostalCode: str(flags.invoicePostalCode) ?? "30-001",
      acceptsLegal: true,
      acceptsDigitalDelivery: true,
    };

    const result = await persistCustomerAndOrder({
      payload,
      values: values as never,
      product: product as never,
    });
    if (!result.ok) throw new Error(result.error);

    const order = await getOrder(result.order.id);
    const customer = await payload.findByID({
      collection: "customers",
      id: order.customer as number,
      depth: 0,
    });
    out({
      order,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        addresses: customer.addresses,
      },
    });
    break;
  }

  case "seed-digital-asset": {
    // The local digital_assets table is empty, but the REAL ebook PDF already
    // lives in the (shared) Vercel Blob store. Reference it via a DB row — NO
    // upload, no blob mutation — so the gated file route can stream a 200, just
    // like prod. remove-digital-asset deletes only the DB row, never the blob.
    const { list } = await import("@vercel/blob");
    const blobs = await list({ limit: 1000 });
    const pdf = blobs.blobs.find((b) =>
      b.pathname.toLowerCase().endsWith(".pdf"),
    );
    if (!pdf) throw new Error("no PDF in blob store to link");

    const products = await payload.find({
      collection: "products",
      where: { slug: { equals: "cookbook-digital" } },
      limit: 1,
      depth: 0,
    });
    const product = products.docs[0];
    if (!product) throw new Error("cookbook-digital not found");
    const previousFileId = (product as { file?: number }).file ?? null;

    const { sql } = await import("drizzle-orm");
    const drizzle = (
      payload.db as unknown as {
        drizzle: {
          execute: (q: unknown) => Promise<{ rows: Array<{ id: number }> }>;
        };
      }
    ).drizzle;

    // Idempotent: clear any stale row on the unique filename first.
    await drizzle.execute(
      sql`DELETE FROM digital_assets WHERE filename = ${pdf.pathname}`,
    );
    const inserted = await drizzle.execute(sql`
      INSERT INTO digital_assets (label, url, filename, mime_type, filesize, created_at, updated_at)
      VALUES ('E2E linked ebook', ${pdf.url}, ${pdf.pathname}, 'application/pdf', ${pdf.size}, now(), now())
      RETURNING id
    `);
    const assetId = inserted.rows[0].id;
    await drizzle.execute(
      sql`UPDATE products SET file_id = ${assetId} WHERE slug = 'cookbook-digital'`,
    );
    out({ assetId, previousFileId, url: pdf.url, linked: true });
    break;
  }

  case "remove-digital-asset": {
    // Unlinks (file_id → NULL, the local baseline) and deletes the DB row only —
    // the blob object stays put.
    const assetId = Number(str(flags.id));
    const { sql } = await import("drizzle-orm");
    const drizzle = (
      payload.db as unknown as {
        drizzle: { execute: (q: unknown) => Promise<unknown> };
      }
    ).drizzle;
    await drizzle.execute(
      sql`UPDATE products SET file_id = NULL WHERE slug = 'cookbook-digital'`,
    );
    if (assetId) {
      await drizzle.execute(
        sql`DELETE FROM digital_assets WHERE id = ${assetId}`,
      );
    }
    out({ removed: assetId });
    break;
  }

  case "seed-admin": {
    const email = str(flags.email);
    const password = str(flags.password);
    if (!email || !password)
      throw new Error("seed-admin requires --email and --password");
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      out({ id: existing.docs[0].id, email, created: false });
      break;
    }
    const user = await payload.create({
      collection: "users",
      data: { email, password, role: "admin" } as never,
    });
    out({ id: user.id, email, created: true });
    break;
  }

  case "cleanup": {
    const marker = str(flags.marker) ?? "+e2e-";
    const customers = await payload.find({
      collection: "customers",
      where: { email: { like: marker } },
      limit: 200,
      depth: 0,
    });
    const customerIds = customers.docs.map((c) => c.id);
    let deletedOrders = 0;
    if (customerIds.length > 0) {
      const del = await payload.delete({
        collection: "orders",
        where: { customer: { in: customerIds } },
      });
      deletedOrders = del.docs.length;
      await payload.delete({
        collection: "customers",
        where: { id: { in: customerIds } },
      });
    }
    // Test admin user (beforeDelete guard keeps the last real user safe).
    let deletedUsers = 0;
    try {
      const usersDel = await payload.delete({
        collection: "users",
        where: { email: { like: "e2e-admin" } },
      });
      deletedUsers = usersDel.docs.length;
    } catch {
      // guard or no match — ignore
    }
    out({ deletedOrders, deletedCustomers: customerIds.length, deletedUsers });
    break;
  }

  default:
    throw new Error(`Unknown command: ${cmd}`);
}

process.exit(0);
