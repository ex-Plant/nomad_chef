import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: {
    singular: { pl: "Klient", en: "Customer" },
    plural: { pl: "Klienci", en: "Customers" },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "lastName", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      label: { pl: "E-mail", en: "Email" },
    },
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
      name: "addresses",
      type: "array",
      label: { pl: "Adresy", en: "Addresses" },
      fields: [
        { name: "line1", type: "text", required: true, label: { pl: "Ulica i numer", en: "Street and number" } },
        { name: "line2", type: "text", label: { pl: "Lokal / dodatkowo", en: "Apartment / extra" } },
        { name: "city", type: "text", required: true, label: { pl: "Miasto", en: "City" } },
        { name: "postalCode", type: "text", required: true, label: { pl: "Kod pocztowy", en: "Postal code" } },
        { name: "country", type: "text", required: true, defaultValue: "PL", label: { pl: "Kraj", en: "Country" } },
      ],
    },
    {
      name: "marketingConsent",
      type: "checkbox",
      defaultValue: false,
      label: { pl: "Zgoda na marketing", en: "Marketing consent" },
    },
    {
      name: "notes",
      type: "textarea",
      label: { pl: "Notatki", en: "Notes" },
    },
  ],
};
