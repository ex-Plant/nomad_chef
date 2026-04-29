import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeAddresses, type AddressT } from "./orders";

const baseShipping: AddressT = {
  line1: "ul. Klonowa 5",
  line2: "",
  city: "Warszawa",
  postalCode: "00-001",
  country: "PL",
};

const sameShippingWithCompany: AddressT = {
  ...baseShipping,
  companyName: "Smaki Sp. z o.o.",
  nip: "5252352342",
};

const otherInvoice: AddressT = {
  companyName: "Smaki Sp. z o.o.",
  nip: "5252352342",
  line1: "Al. Jerozolimskie 100",
  line2: "",
  city: "Warszawa",
  postalCode: "02-001",
  country: "PL",
};

describe("mergeAddresses", () => {
  it("returns existing list unchanged when nothing to add", () => {
    const { merged, changed } = mergeAddresses([baseShipping], []);
    assert.equal(changed, false);
    assert.deepEqual(merged, [baseShipping]);
  });

  it("appends a new address that does not match by line1+postalCode", () => {
    const { merged, changed } = mergeAddresses([baseShipping], [otherInvoice]);
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
    assert.deepEqual(merged[1], otherInvoice);
  });

  it("does not duplicate identical address (same line1+postalCode, no nip)", () => {
    const { merged, changed } = mergeAddresses([baseShipping], [baseShipping]);
    assert.equal(changed, false);
    assert.equal(merged.length, 1);
  });

  it("upgrades existing entry when new entry has companyName+nip and existing does not", () => {
    const { merged, changed } = mergeAddresses(
      [baseShipping],
      [sameShippingWithCompany],
    );
    assert.equal(changed, true);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].companyName, "Smaki Sp. z o.o.");
    assert.equal(merged[0].nip, "5252352342");
  });

  it("does not overwrite existing companyName/nip with new values", () => {
    const existing: AddressT = {
      ...baseShipping,
      companyName: "OldCo",
      nip: "1111111111",
    };
    const incoming: AddressT = {
      ...baseShipping,
      companyName: "NewCo",
      nip: "9999999999",
    };
    const { merged, changed } = mergeAddresses([existing], [incoming]);
    assert.equal(changed, false);
    assert.equal(merged[0].companyName, "OldCo");
    assert.equal(merged[0].nip, "1111111111");
  });

  it("merges multiple new entries against multiple existing", () => {
    const { merged, changed } = mergeAddresses(
      [baseShipping],
      [baseShipping, otherInvoice],
    );
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
  });

  it("starts from an empty list", () => {
    const { merged, changed } = mergeAddresses([], [baseShipping, otherInvoice]);
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
  });
});
