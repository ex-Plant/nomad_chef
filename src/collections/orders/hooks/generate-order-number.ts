import type { CollectionBeforeChangeHook } from "payload";
import { formatOrderNumber } from "@/lib/billing";

export const generateOrderNumber: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== "create") return data;
  if (data.orderNumber) return data;

  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1).toISOString();
  const endOfYear = new Date(year + 1, 0, 1).toISOString();

  const existing = await req.payload.count({
    collection: "orders",
    where: {
      createdAt: { greater_than_equal: startOfYear, less_than: endOfYear },
    },
  });

  data.orderNumber = formatOrderNumber(year, existing.totalDocs + 1);
  return data;
};
