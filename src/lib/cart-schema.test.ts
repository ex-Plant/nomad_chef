import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cartFormSchema, defaultCartValues } from "./cart-schema";

const valid = {
  format: "digital" as const,
  productSlug: "cookbook-digital",
  email: "anna@test.local",
  firstName: "Anna",
  lastName: "Kowalska",
  wantsInvoice: false,
  quantity: 1,
  shippingLine1: "",
  shippingLine2: "",
  shippingCity: "",
  shippingPostalCode: "",
  shippingCountry: "PL",
  companyName: "",
  nip: "",
  useShippingAsInvoice: true,
  invoiceLine1: "",
  invoiceLine2: "",
  invoiceCity: "",
  invoicePostalCode: "",
  invoiceCountry: "PL",
  notes: "",
  acceptsTerms: true,
  acceptsPrivacy: true,
};

describe("defaultCartValues", () => {
  it("returns digital defaults", () => {
    const v = defaultCartValues("digital", "cookbook-digital");
    assert.equal(v.format, "digital");
    assert.equal(v.productSlug, "cookbook-digital");
    assert.equal(v.quantity, 1);
    assert.equal(v.wantsInvoice, false);
    assert.equal(v.useShippingAsInvoice, true);
    assert.equal(v.shippingCountry, "PL");
    assert.equal(v.invoiceCountry, "PL");
  });
});

describe("cartFormSchema — terms & privacy acceptance", () => {
  it("rejects when acceptsTerms is false", () => {
    const r = cartFormSchema.safeParse({ ...valid, acceptsTerms: false });
    assert.equal(r.success, false);
  });

  it("rejects when acceptsPrivacy is false", () => {
    const r = cartFormSchema.safeParse({ ...valid, acceptsPrivacy: false });
    assert.equal(r.success, false);
  });
});

describe("cartFormSchema — digital, no invoice", () => {
  it("accepts a minimal valid digital order", () => {
    const r = cartFormSchema.safeParse(valid);
    assert.equal(r.success, true);
  });

  it("rejects bad email", () => {
    const r = cartFormSchema.safeParse({ ...valid, email: "not-an-email" });
    assert.equal(r.success, false);
  });

  it("accepts empty firstName (optional)", () => {
    const r = cartFormSchema.safeParse({ ...valid, firstName: "" });
    assert.equal(r.success, true);
  });

  it("does NOT require shipping for digital", () => {
    const r = cartFormSchema.safeParse({
      ...valid,
      shippingLine1: "",
      shippingCity: "",
      shippingPostalCode: "",
    });
    assert.equal(r.success, true);
  });
});

describe("cartFormSchema — digital + invoice", () => {
  const base = {
    ...valid,
    wantsInvoice: true,
    companyName: "Smaki Sp. z o.o.",
    nip: "5252352342",
    invoiceLine1: "Al. Jerozolimskie 100",
    invoiceCity: "Warszawa",
    invoicePostalCode: "02-001",
  };

  it("accepts a complete digital invoice order", () => {
    const r = cartFormSchema.safeParse(base);
    assert.equal(r.success, true);
  });

  it("rejects missing companyName", () => {
    const r = cartFormSchema.safeParse({ ...base, companyName: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed NIP (9 digits)", () => {
    const r = cartFormSchema.safeParse({ ...base, nip: "123456789" });
    assert.equal(r.success, false);
  });

  it("rejects missing invoice address", () => {
    const r = cartFormSchema.safeParse({ ...base, invoiceLine1: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed invoice postal code", () => {
    const r = cartFormSchema.safeParse({ ...base, invoicePostalCode: "00001" });
    assert.equal(r.success, false);
  });
});

describe("cartFormSchema — physical, no invoice", () => {
  const base = {
    ...valid,
    format: "physical" as const,
    productSlug: "cookbook-physical",
    quantity: 2,
    shippingLine1: "ul. Klonowa 5",
    shippingCity: "Warszawa",
    shippingPostalCode: "00-001",
  };

  it("accepts a physical order with shipping", () => {
    const r = cartFormSchema.safeParse(base);
    assert.equal(r.success, true);
  });

  it("rejects missing shipping line1", () => {
    const r = cartFormSchema.safeParse({ ...base, shippingLine1: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed shipping postal", () => {
    const r = cartFormSchema.safeParse({ ...base, shippingPostalCode: "00001" });
    assert.equal(r.success, false);
  });
});

describe("cartFormSchema — physical + invoice", () => {
  const base = {
    ...valid,
    format: "physical" as const,
    productSlug: "cookbook-physical",
    quantity: 1,
    shippingLine1: "ul. Klonowa 5",
    shippingCity: "Warszawa",
    shippingPostalCode: "00-001",
    wantsInvoice: true,
    companyName: "Smaki Sp. z o.o.",
    nip: "5252352342",
  };

  it("accepts when useShippingAsInvoice is true and invoice address is empty", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: true,
      invoiceLine1: "",
      invoiceCity: "",
      invoicePostalCode: "",
    });
    assert.equal(r.success, true);
  });

  it("rejects when useShippingAsInvoice is false and invoice address is empty", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: false,
      invoiceLine1: "",
      invoiceCity: "",
      invoicePostalCode: "",
    });
    assert.equal(r.success, false);
  });

  it("accepts when useShippingAsInvoice is false and invoice address is provided", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: false,
      invoiceLine1: "Al. Jerozolimskie 100",
      invoiceCity: "Warszawa",
      invoicePostalCode: "02-001",
    });
    assert.equal(r.success, true);
  });
});
