import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcVat,
  deriveDownloadToken,
  generateDownloadToken,
  formatOrderNumber,
  roundMoney,
} from "@/lib/checkout/billing";

describe("calcVat", () => {
  it("splits 49.99 PLN at 23% into net 40.64 + vat 9.35", () => {
    const result = calcVat(49.99, 23);
    assert.equal(result.priceNet, 40.64);
    assert.equal(result.vatAmount, 9.35);
  });

  it("returns priceNet equal to gross and vatAmount 0 when rate is 0", () => {
    const result = calcVat(99.99, 0);
    assert.equal(result.priceNet, 99.99);
    assert.equal(result.vatAmount, 0);
  });

  it("splits 49.99 PLN at 5% so net + vat sums back to gross", () => {
    const result = calcVat(49.99, 5);
    assert.equal(result.priceNet, 47.61);
    assert.equal(result.vatAmount, 2.38);
    assert.equal(roundMoney(result.priceNet + result.vatAmount), 49.99);
  });

  it("returns zeros for zero gross", () => {
    const result = calcVat(0, 23);
    assert.equal(result.priceNet, 0);
    assert.equal(result.vatAmount, 0);
  });
});

describe("roundMoney", () => {
  it("rounds to 2 decimal places", () => {
    assert.equal(roundMoney(40.6422), 40.64);
    assert.equal(roundMoney(40.645), 40.65);
    assert.equal(roundMoney(0.1 + 0.2), 0.3);
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

describe("deriveDownloadToken", () => {
  it("returns a token matching the strict download-token format (48 hex)", () => {
    assert.match(deriveDownloadToken(39, "secret"), /^[0-9a-f]{48}$/);
  });

  // The property that makes the issuance race harmless: two concurrent
  // fulfillment paths derive the IDENTICAL token, so an overwrite writes the
  // same bytes — the emailed link can never diverge from the stored one.
  it("is deterministic for the same order id + secret", () => {
    assert.equal(
      deriveDownloadToken(39, "secret"),
      deriveDownloadToken(39, "secret"),
    );
  });

  it("differs across order ids", () => {
    assert.notEqual(
      deriveDownloadToken(39, "secret"),
      deriveDownloadToken(40, "secret"),
    );
  });

  it("differs across secrets", () => {
    assert.notEqual(
      deriveDownloadToken(39, "secret-a"),
      deriveDownloadToken(39, "secret-b"),
    );
  });
});

describe("formatOrderNumber", () => {
  it("formats zero-padded sequence + year", () => {
    assert.equal(formatOrderNumber(2026, 1), "0001-2026");
    assert.equal(formatOrderNumber(2026, 42), "0042-2026");
    assert.equal(formatOrderNumber(2026, 9999), "9999-2026");
  });

  it("expands beyond 4 digits when needed", () => {
    assert.equal(formatOrderNumber(2030, 12345), "12345-2030");
  });
});
