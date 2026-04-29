import { getPayload } from "payload";
import config from "@payload-config";
import type { Customer, Product } from "@/payload-types";

type FindOrCreateProductArgsT = {
  slug: string;
  data: Omit<Parameters<Awaited<ReturnType<typeof getPayload>>["create"]>[0]["data"], "slug">;
};

async function main() {
  const payload = await getPayload({ config });

  console.log("→ products");
  const digital = (await findOrCreateProduct(payload, "cookbook-digital", {
    title: "Książka cyfrowa",
    format: "digital",
    priceGross: 49.99,
    vatRate: "5",
    currency: "PLN",
    active: true,
  })) as Product;

  const physical = (await findOrCreateProduct(payload, "cookbook-physical", {
    title: "Książka fizyczna",
    format: "physical",
    priceGross: 99.99,
    vatRate: "5",
    currency: "PLN",
    stockQty: 50,
    active: true,
  })) as Product;

  console.log(`  digital  #${digital.id}  ${digital.priceGross} PLN`);
  console.log(`  physical #${physical.id}  ${physical.priceGross} PLN  stock=${physical.stockQty}`);

  console.log("→ customers");
  const consumer = (await findOrCreateCustomer(payload, "anna@test.local", {
    firstName: "Anna",
    lastName: "Kowalska",
    addresses: [
      {
        line1: "ul. Klonowa 5",
        city: "Warszawa",
        postalCode: "00-001",
        country: "PL",
      },
    ],
  })) as Customer;

  const business = (await findOrCreateCustomer(payload, "biuro@smaki.pl", {
    firstName: "Marek",
    lastName: "Nowak",
    addresses: [
      {
        companyName: "Smaki Sp. z o.o.",
        nip: "5252352342",
        line1: "Al. Jerozolimskie 100",
        city: "Warszawa",
        postalCode: "02-001",
        country: "PL",
      },
    ],
  })) as Customer;

  console.log(`  consumer #${consumer.id}  ${consumer.email}`);
  console.log(`  business #${business.id}  ${business.email}`);

  const existingOrders = await payload.find({ collection: "orders", limit: 1000, depth: 0 });
  if (existingOrders.docs.length > 0) {
    console.log(`→ wiping ${existingOrders.docs.length} existing orders`);
    for (const o of existingOrders.docs) {
      await payload.delete({ collection: "orders", id: o.id });
    }
  }

  // Reset stock — releaseStockOnDelete should have restored it, but force-set for clean baseline.
  await payload.update({
    collection: "products",
    id: physical.id,
    data: { stockQty: 50 },
  });

  console.log("→ orders");
  const blueprints = [
    { customer: consumer.id, product: digital.id, quantity: 1, paymentStatus: "pending" as const },
    { customer: consumer.id, product: digital.id, quantity: 1, paymentStatus: "paid" as const },
    { customer: consumer.id, product: digital.id, quantity: 1, paymentStatus: "failed" as const },
    { customer: consumer.id, product: physical.id, quantity: 1, paymentStatus: "pending" as const },
    { customer: consumer.id, product: physical.id, quantity: 2, paymentStatus: "paid" as const },
    {
      customer: business.id,
      product: physical.id,
      quantity: 3,
      paymentStatus: "paid" as const,
      wantsInvoice: true,
    },
  ];

  for (const data of blueprints) {
    const order = await payload.create({ collection: "orders", data });
    console.log(
      `  ${order.orderNumber}  ${order.paymentStatus.padEnd(7)}  ${data.quantity}x  ${order.totalGross} PLN${
        data.wantsInvoice ? "  [invoice]" : ""
      }`
    );
  }

  const finalStock = await payload.findByID({ collection: "products", id: physical.id });
  console.log(`\nphysical stockQty: 50 → ${finalStock.stockQty}`);
  console.log("Done.");
  process.exit(0);
}

async function findOrCreateProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  data: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt" | "sizes" | "priceNet">
) {
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0];
  return payload.create({ collection: "products", data: { slug, ...data } });
}

async function findOrCreateCustomer(
  payload: Awaited<ReturnType<typeof getPayload>>,
  email: string,
  data: Omit<Customer, "id" | "email" | "createdAt" | "updatedAt">
) {
  const existing = await payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0];
  return payload.create({ collection: "customers", data: { email, ...data } });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
