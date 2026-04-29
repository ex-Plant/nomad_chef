import { z } from "zod";

const POSTAL_CODE_RE = /^\d{2}-\d{3}$/;
const NIP_RE = /^\d{10}$/;

// Flat object (not z.discriminatedUnion). TanStack Form keeps unmounted field
// values in a single state shape; flattening here lets the form layer use one
// stable type. Conditional requiredness lives in superRefine below.
export const cartFormSchema = z
  .object({
    format: z.enum(["digital", "physical"]),
    productSlug: z.string().min(1),
    email: z.email("Nieprawidłowy adres e-mail").trim().toLowerCase(),
    firstName: z.string().trim().min(1, "Wymagane"),
    lastName: z.string().trim().min(1, "Wymagane"),
    wantsInvoice: z.boolean(),
    quantity: z.number().int().min(1).max(99),
    shippingLine1: z.string().trim(),
    shippingLine2: z.string().trim(),
    shippingCity: z.string().trim(),
    shippingPostalCode: z.string().trim(),
    shippingCountry: z.string().trim(),
    companyName: z.string().trim(),
    nip: z.string().trim(),
    useShippingAsInvoice: z.boolean(),
    invoiceLine1: z.string().trim(),
    invoiceLine2: z.string().trim(),
    invoiceCity: z.string().trim(),
    invoicePostalCode: z.string().trim(),
    invoiceCountry: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.format === "physical") {
      if (!data.shippingLine1)
        ctx.addIssue({ path: ["shippingLine1"], code: "custom", message: "Wymagane" });
      if (!data.shippingCity)
        ctx.addIssue({ path: ["shippingCity"], code: "custom", message: "Wymagane" });
      if (!POSTAL_CODE_RE.test(data.shippingPostalCode))
        ctx.addIssue({ path: ["shippingPostalCode"], code: "custom", message: "Format: 00-000" });
    }
    if (data.wantsInvoice) {
      if (!data.companyName)
        ctx.addIssue({ path: ["companyName"], code: "custom", message: "Wymagane" });
      if (!NIP_RE.test(data.nip))
        ctx.addIssue({
          path: ["nip"],
          code: "custom",
          message: "Nieprawidłowy numer NIP",
        });
      const needsInvoiceAddress =
        data.format === "digital" || !data.useShippingAsInvoice;
      if (needsInvoiceAddress) {
        if (!data.invoiceLine1)
          ctx.addIssue({ path: ["invoiceLine1"], code: "custom", message: "Wymagane" });
        if (!data.invoiceCity)
          ctx.addIssue({ path: ["invoiceCity"], code: "custom", message: "Wymagane" });
        if (!POSTAL_CODE_RE.test(data.invoicePostalCode))
          ctx.addIssue({ path: ["invoicePostalCode"], code: "custom", message: "Format: 00-000" });
      }
    }
  });

export type CartFormValuesT = z.infer<typeof cartFormSchema>;

export function defaultCartValues(
  format: "digital" | "physical",
  productSlug: string,
): CartFormValuesT {
  return {
    format,
    productSlug,
    email: "",
    firstName: "",
    lastName: "",
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
  };
}
