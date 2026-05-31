// Payload returns a relationship as either its id (a `number`) or the full
// document, depending on the `depth` the parent was queried with. When you've
// ALREADY fetched at sufficient depth and just need TypeScript to see the
// document, this narrows the union without a second DB round-trip: populated →
// the doc, id (or absent) → `null`. Use `resolveRelation` instead when you must
// guarantee a doc and are willing to fetch the id case.
//
// The explicit `!== null` matters: `typeof null === "object"` is `true`, so a
// nullable relation (e.g. an optional `file`) would otherwise slip through as a
// fake "populated" value.
export function asPopulated<TDoc extends object>(
  value: number | string | null | undefined | TDoc,
): TDoc | null {
  return typeof value === "object" && value !== null ? value : null;
}
