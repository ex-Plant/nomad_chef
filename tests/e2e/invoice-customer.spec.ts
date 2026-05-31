/**
 * Audit — invoice + customer data capture. Drives the real persist pipeline
 * (persistCustomerAndOrder → buildAddressesToAdd → findOrCreateCustomer) for a
 * digital order with invoice data, and verifies dedup on repeat orders.
 */
import { test, expect } from "@playwright/test";
import { db, uniqueBuyerEmail } from "./fixtures/db";

test("invoice order stores company + NIP + invoice address on the customer", () => {
  const email = uniqueBuyerEmail("invoice");
  const { order, customer } = db.invoiceOrder({ email });

  expect(order.wantsInvoice).toBe(true);
  expect(order.paymentStatus).toBe("pending");

  expect(customer.email).toBe(email);
  expect(customer.addresses).toHaveLength(1);
  const addr = customer.addresses![0];
  expect(addr.companyName).toBe("Testowa Sp. z o.o.");
  expect(addr.nip).toBe("1234567890");
  expect(addr.line1).toBe("ul. Fakturowa 5");
  expect(addr.city).toBe("Krakow");
  expect(addr.postalCode).toBe("30-001");
  expect(addr.country).toBe("PL");
});

test("repeat orders from one email reuse the customer and don't duplicate the address", () => {
  const email = uniqueBuyerEmail("dedup");
  const first = db.invoiceOrder({ email });
  const second = db.invoiceOrder({ email });

  expect(second.customer.id).toBe(first.customer.id);
  expect(second.customer.addresses).toHaveLength(1);
});
