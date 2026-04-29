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
  access: {
    update: ({ req: { user }, id }) =>
      user?.role === "admin" || user?.id === id,
  },
  auth: true,
  hooks: {
    beforeDelete: [
      async ({ req }) => {
        const userCount = await req.payload.count({ collection: "users" });
        if (userCount.totalDocs <= 1) {
          throw new Error("Nie można usunąć ostatniego użytkownika");
        }
      },
    ],
  },
  fields: [
    {
      name: "role",
      type: "select",
      label: {
        pl: "Rola",
        en: "Role",
      },
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      defaultValue: "editor",
      required: true,
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
  ],
};
