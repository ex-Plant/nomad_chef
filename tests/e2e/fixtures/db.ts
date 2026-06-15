/**
 * Thin wrapper over tests/e2e/helpers/db-cli.ts. Shells out to the tsx CLI
 * (which boots Payload via --import tsx, the only loader that resolves
 * payload.config) and parses the sentinel-prefixed JSON result line.
 */
import { execFileSync } from "node:child_process";

const CLI = "tests/e2e/helpers/db-cli.ts";
const PREFIX = "__E2E_RESULT__";

export type OrderRowT = {
  id: number;
  orderNumber: string;
  totalGross: number;
  quantity: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  wantsInvoice?: boolean | null;
  paymentRef?: string | null;
  paidAt?: string | null;
  downloadToken?: string | null;
  downloadExpiresAt?: string | null;
  downloadEmailStatus?: string | null;
  downloadEmailSentAt?: string | null;
  downloadEmailError?: string | null;
  customerId?: number;
};

export type AddressRowT = {
  companyName?: string | null;
  nip?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode: string;
  country: string;
};

export type CustomerRowT = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  addresses?: AddressRowT[];
};

function run<T = OrderRowT>(args: readonly string[]): T {
  let stdout = "";
  try {
    stdout = execFileSync(
      "node",
      ["--env-file=.env", "--import", "tsx", CLI, ...args],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (err) {
    const e = err as { stderr?: string; message?: string };
    throw new Error(`db-cli ${args[0]} failed: ${e.stderr || e.message}`);
  }
  const line = stdout.split("\n").find((l) => l.startsWith(PREFIX));
  if (!line) throw new Error(`db-cli ${args[0]}: no result line.\n${stdout}`);
  return JSON.parse(line.slice(PREFIX.length)) as T;
}

export const db = {
  createOrder(input: {
    email: string;
    format?: "digital" | "physical";
    invoice?: boolean;
  }): OrderRowT {
    return run([
      "create-order",
      "--email",
      input.email,
      "--format",
      input.format ?? "digital",
      ...(input.invoice ? ["--invoice"] : []),
    ]);
  },
  flipPaid(id: number): OrderRowT {
    return run(["flip-paid", "--id", String(id)]);
  },
  patchOrder(id: number, fields: Record<string, string>): OrderRowT {
    return run([
      "patch-order",
      "--id",
      String(id),
      ...Object.entries(fields).flatMap(([k, v]) => [`--${k}`, v]),
    ]);
  },
  getOrder(id: number): OrderRowT {
    return run(["get-order", "--id", String(id)]);
  },
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
  invoiceOrder(input: { email: string }): {
    order: OrderRowT;
    customer: CustomerRowT;
  } {
    return run(["invoice-order", "--email", input.email]);
  },
  // Links cookbook-digital to the ebook PDF already in the Blob store (no
  // upload). Returns the asset id + the product's previous file id to restore.
  seedDigitalAsset(): {
    assetId: number;
    previousFileId: number | null;
    url: string;
  } {
    return run(["seed-digital-asset"]);
  },
  removeDigitalAsset(assetId: number): unknown {
    return run(["remove-digital-asset", "--id", String(assetId)]);
  },
  emailRetrySweep(): { swept: number; resent: number } {
    return run<{ swept: number; resent: number }>(["email-retry-sweep"]);
  },
  seedAdmin(input: { email: string; password: string }): {
    id: number;
    email: string;
    created: boolean;
  } {
    return run([
      "seed-admin",
      "--email",
      input.email,
      "--password",
      input.password,
    ]);
  },
};

// Unique buyer address per test. Gmail plus-addressing delivers every variant
// to konradantonik@gmail.com (so the real customer emails are visible), while
// the `+e2e-` marker is what global-teardown cleans up.
export function uniqueBuyerEmail(label: string): string {
  return `konradantonik+e2e-${label}-${Date.now()}@gmail.com`;
}
