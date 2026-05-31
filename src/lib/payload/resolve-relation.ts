import type {
  CollectionSlug,
  DataFromCollectionSlug,
  PayloadRequest,
} from "payload";

type ResolveRelationArgsT<TSlug extends CollectionSlug> = {
  readonly collection: TSlug;
  readonly value: number | string | DataFromCollectionSlug<TSlug>;
  readonly req: PayloadRequest;
};

// Payload types every relationship as `id | Doc` regardless of query depth, so a
// populated object and a bare id are indistinguishable to the compiler. This
// collapses the union: object → return as-is, id → fetch at depth 0.
export async function resolveRelation<TSlug extends CollectionSlug>({
  collection,
  value,
  req,
}: ResolveRelationArgsT<TSlug>): Promise<DataFromCollectionSlug<TSlug>> {
  if (typeof value === "object") return value;

  // value = id
  return req.payload.findByID({ collection, id: value, depth: 0, req });
}
