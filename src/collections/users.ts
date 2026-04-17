import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: { pl: "Użytkownik", en: "User" },
    plural: { pl: "Użytkownicy", en: "Users" },
  },
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
};
