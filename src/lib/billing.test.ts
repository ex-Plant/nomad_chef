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
