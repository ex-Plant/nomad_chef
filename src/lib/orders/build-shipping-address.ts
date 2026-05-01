import type { CartFormValuesT } from "@/lib/cart-schema";

const DEFAULT_COUNTRY = "PL";

export function buildShippingAddressForOrder(values: CartFormValuesT) {
  if (values.format !== "physical") {
    return undefined;
  }

  return {
    firstName: values.firstName,
    lastName: values.lastName,
    line1: values.shippingLine1,
    line2: values.shippingLine2 || undefined,
    city: values.shippingCity,
    postalCode: values.shippingPostalCode,
    country: values.shippingCountry || DEFAULT_COUNTRY,
  };
}
