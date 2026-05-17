import type { Access, CollectionConfig } from "payload";
import { generateOrderNumber } from "./hooks/generate-order-number";
import { snapshotOrder } from "./hooks/snapshot";
import { upsertCustomer } from "./hooks/upsert-customer";
import { digitalFulfillment } from "./hooks/digital-fulfillment";
import { physicalShipped } from "./hooks/physical-shipped";
import {
  blockOrderMutations,
  releaseStockOnDelete,
  stockTransitions,
  validateStockOnCreate,
} from "./hooks/stock";
import { regenerateDownloadEndpoint } from "./endpoints/regenerate-download";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);

function getProductFormat(data: unknown): "digital" | "physical" | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { product?: { format?: unknown } | unknown };
  if (typeof d.product !== "object" || d.product === null) return undefined;
  const format = (d.product as { format?: unknown }).format;
  if (format === "digital" || format === "physical") return format;
  return undefined;
}

const whenDigitalOrder = (data: unknown) =>
  getProductFormat(data) === "digital";
const whenPhysicalOrder = (data: unknown) =>
  getProductFormat(data) === "physical";

export const Orders: CollectionConfig = {
  slug: "orders",
  endpoints: [regenerateDownloadEndpoint],
  hooks: {
    beforeChange: [
      blockOrderMutations,
      validateStockOnCreate,
      upsertCustomer,
      snapshotOrder,
      generateOrderNumber,
    ],
    afterChange: [stockTransitions, digitalFulfillment, physicalShipped],
    beforeDelete: [releaseStockOnDelete],
  },
  labels: {
    singular: { pl: "Zamówienie", en: "Order" },
    plural: { pl: "Zamówienia", en: "Orders" },
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: [
      "orderNumber",
      "customer",
      "product",
      "totalGross",
      "paymentStatus",
      "fulfillmentStatus",
      "createdAt",
    ],
  },
  access: {
    read: requireAuth,
    create: requireAuth,
    update: requireAuth,
    delete: requireAuth,
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
      label: { pl: "Numer zamówienia", en: "Order number" },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      required: true,
      label: { pl: "Klient", en: "Customer" },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      label: { pl: "Produkt", en: "Product" },
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      label: { pl: "Ilość", en: "Quantity" },
    },
    {
      name: "unitPriceGross",
      type: "number",
      required: true,
      admin: {
        readOnly: true,
        description: {
          pl: "Snapshot z chwili sprzedaży",
          en: "Snapshot at sale time",
        },
      },
      label: { pl: "Cena jedn. brutto (PLN)", en: "Unit price gross (PLN)" },
    },
    {
      name: "totalGross",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma brutto (PLN)", en: "Total gross (PLN)" },
    },
    {
      name: "priceNet",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma netto (PLN)", en: "Total net (PLN)" },
    },
    {
      name: "vatRate",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Stawka VAT (%)", en: "VAT rate (%)" },
    },
    {
      name: "vatAmount",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Kwota VAT (PLN)", en: "VAT amount (PLN)" },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "PLN",
      label: { pl: "Waluta", en: "Currency" },
      options: [{ label: "PLN", value: "PLN" }],
    },
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      label: { pl: "Status płatności", en: "Payment status" },
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Opłacone", en: "Paid" }, value: "paid" },
        { label: { pl: "Nieudane", en: "Failed" }, value: "failed" },
        { label: { pl: "Zwrot", en: "Refunded" }, value: "refunded" },
      ],
    },
    {
      name: "paymentRef",
      type: "text",
      index: true,
      label: { pl: "ID transakcji", en: "Transaction ID" },
    },
    {
      name: "fulfillmentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      label: { pl: "Status realizacji", en: "Fulfillment status" },
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        {
          label: { pl: "Wysłane / dostarczone", en: "Fulfilled" },
          value: "fulfilled",
        },
        { label: { pl: "Wysłane (kurier)", en: "Shipped" }, value: "shipped" },
        { label: { pl: "Dostarczone", en: "Delivered" }, value: "delivered" },
      ],
    },
    {
      name: "regenerateDownload",
      type: "ui",
      admin: {
        condition: (data) => Boolean(data?.downloadToken),
        components: {
          Field:
            "@/collections/orders/components/regenerate-download-buttons#RegenerateDownloadButtons",
        },
      },
    },
    {
      name: "downloadToken",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, condition: whenDigitalOrder },
      label: { pl: "Token pobrania", en: "Download token" },
    },
    {
      name: "downloadExpiresAt",
      type: "date",
      admin: { readOnly: true, condition: whenDigitalOrder },
      label: { pl: "Pobranie wygasa", en: "Download expires at" },
    },
    {
      name: "lastDownloadAt",
      type: "date",
      admin: {
        readOnly: true,
        condition: whenDigitalOrder,
        date: {
          pickerAppearance: "dayAndTime",
          displayFormat: "yyyy-MM-dd HH:mm",
        },
      },
      label: { pl: "Ostatnie pobranie", en: "Last download at" },
    },
    {
      name: "shippingAddress",
      type: "group",
      admin: { condition: whenPhysicalOrder },
      label: { pl: "Adres dostawy", en: "Shipping address" },
      fields: [
        {
          name: "firstName",
          type: "text",
          label: { pl: "Imię", en: "First name" },
        },
        {
          name: "lastName",
          type: "text",
          label: { pl: "Nazwisko", en: "Last name" },
        },
        {
          name: "line1",
          type: "text",
          label: { pl: "Ulica i numer", en: "Street and number" },
        },
        {
          name: "line2",
          type: "text",
          label: { pl: "Lokal", en: "Apt / suite" },
        },
        {
          name: "city",
          type: "text",
          label: { pl: "Miasto", en: "City" },
        },
        {
          name: "postalCode",
          type: "text",
          label: { pl: "Kod pocztowy", en: "Postal code" },
        },
        {
          name: "country",
          type: "text",
          defaultValue: "PL",
          label: { pl: "Kraj", en: "Country" },
        },
      ],
    },
    {
      name: "tracking",
      type: "text",
      admin: { condition: whenPhysicalOrder },
      label: { pl: "Numer przesyłki", en: "Tracking number" },
    },
    {
      name: "courier",
      type: "select",
      label: { pl: "Kurier", en: "Courier" },
      options: [
        { label: "InPost", value: "inpost" },
        { label: "DPD", value: "dpd" },
        { label: "DHL", value: "dhl" },
        { label: "Poczta Polska", value: "poczta-polska" },
        { label: { pl: "Inny", en: "Other" }, value: "other" },
      ],
      admin: { condition: whenPhysicalOrder },
    },
    {
      name: "shippedAt",
      type: "date",
      admin: { condition: whenPhysicalOrder },
      label: { pl: "Data wysyłki", en: "Shipped at" },
    },
    {
      name: "wantsInvoice",
      type: "checkbox",
      defaultValue: false,
      index: true,
      label: { pl: "Chcę fakturę", en: "Wants VAT invoice" },
      admin: {
        description: {
          pl: "Zaznacz, jeśli klient prosi o fakturę. Sprawdź dane firmy i NIP w adresie klienta.",
          en: "Check if the customer requested an invoice. Verify company name + NIP in the customer's address.",
        },
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: { pl: "Notatki wewnętrzne", en: "Internal notes" },
    },
    {
      name: "paidAt",
      type: "date",
      admin: { readOnly: true },
      label: { pl: "Data opłacenia", en: "Paid at" },
    },
    {
      name: "fulfilledAt",
      type: "date",
      admin: { readOnly: true },
      label: { pl: "Data realizacji", en: "Fulfilled at" },
    },
    {
      name: "confirmationEmailStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      admin: { readOnly: true },
      label: {
        pl: "Status e-maila potwierdzającego",
        en: "Confirmation email status",
      },
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Wysłany", en: "Sent" }, value: "sent" },
        { label: { pl: "Nie wysłano", en: "Failed" }, value: "failed" },
      ],
    },
    {
      name: "confirmationEmailSentAt",
      type: "date",
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: "dayAndTime",
          displayFormat: "yyyy-MM-dd HH:mm",
        },
      },
      label: { pl: "E-mail wysłany o", en: "Email sent at" },
    },
    {
      name: "confirmationEmailError",
      type: "text",
      admin: { readOnly: true },
      label: { pl: "Błąd wysyłki e-maila", en: "Email send error" },
    },
  ],
};
