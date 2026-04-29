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
