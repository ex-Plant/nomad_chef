import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
} from "payload";
import { tracksInventory } from "@/lib/inventory-policy";

type ProductRefT =
  | {
      id: string | number;
      format?: string;
      inventoryPolicy?: string | null;
    }
  | string
  | number;

function resolveProductId(
  ref: ProductRefT | undefined | null,
): string | number | undefined {
  if (ref === undefined || ref === null) return undefined;
  return typeof ref === "object" ? ref.id : ref;
}

function isCommitted(status: string | null | undefined): boolean {
  return status === "paid";
}

async function loadProduct(req: PayloadRequest, id: string | number) {
  return req.payload.findByID({ collection: "products", id, depth: 0, req });
}

async function adjustStock(
  req: PayloadRequest,
  productId: string | number,
  delta: number,
) {
  const current = await loadProduct(req, productId);
  const stockQty = Math.max(0, (current.stockQty ?? 0) + delta);
  await req.payload.update({
    collection: "products",
    id: productId,
    data: { stockQty },
    req,
  });
}

export const validateStockOnCreate: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== "create") return data;
  const productId = resolveProductId(data.product);
  if (!productId) return data;
  if (!isCommitted(data.paymentStatus ?? "pending")) return data;

  const product = await loadProduct(req, productId);
  if (!tracksInventory(product)) return data;

  const qty = data.quantity ?? 1;
  const available = product.stockQty ?? 0;
  if (available < qty) {
    throw new Error(
      `Brak stanu magazynowego (dostępne: ${available}, żądane: ${qty}).`,
    );
  }
  return data;
};

export const blockOrderMutations: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation !== "update" || !originalDoc) return data;
  if (data.quantity !== undefined && data.quantity !== originalDoc.quantity) {
    throw new Error(
      "Nie można zmienić ilości w istniejącym zamówieniu. Anuluj i utwórz nowe.",
    );
  }
  const newProductId = resolveProductId(data.product);
  const oldProductId = resolveProductId(originalDoc.product);
  if (newProductId !== undefined && newProductId !== oldProductId) {
    throw new Error(
      "Nie można zmienić produktu w istniejącym zamówieniu. Anuluj i utwórz nowe.",
    );
  }
  return data;
};

export const stockTransitions: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  if (context?.skipStockUpdate) return doc;
  const productId = resolveProductId(doc.product);
  if (!productId) return doc;

  const product =
    typeof doc.product === "object" &&
    (doc.product?.format || doc.product?.inventoryPolicy)
      ? doc.product
      : await loadProduct(req, productId);
  if (!tracksInventory(product)) return doc;

  const qty = doc.quantity ?? 1;

  if (operation === "create") {
    if (isCommitted(doc.paymentStatus)) {
      await adjustStock(req, productId, -qty);
    }
    return doc;
  }

  if (operation !== "update" || !previousDoc) return doc;

  const wasCommitted = isCommitted(previousDoc.paymentStatus);
  const isCommittedNow = isCommitted(doc.paymentStatus);

  if (wasCommitted && !isCommittedNow) {
    await adjustStock(req, productId, qty);
  } else if (!wasCommitted && isCommittedNow) {
    const current = await loadProduct(req, productId);
    if ((current.stockQty ?? 0) < qty) {
      throw new Error("Brak stanu magazynowego do reaktywacji zamówienia.");
    }
    await adjustStock(req, productId, -qty);
  }

  return doc;
};

export const releaseStockOnDelete: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const order = await req.payload.findByID({
    collection: "orders",
    id,
    depth: 0,
    req,
  });
  if (!order) return;
  if (!isCommitted(order.paymentStatus)) return;

  const productId = resolveProductId(order.product);
  if (!productId) return;

  const product = await loadProduct(req, productId);
  if (!tracksInventory(product)) return;

  await adjustStock(req, productId, order.quantity ?? 1);
};
