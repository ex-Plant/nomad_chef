import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type { CartFormValuesT } from "@/lib/cart-schema";

// TanStack Form 1.29's `ReactFormExtendedApi` has 12 generic params (validators
// + submit meta). At our call sites the validator slots are always `undefined`
// — we use `validators: { onSubmit: zodSchema }`, which the type system reads
// as the schema, not `undefined`. Threading the precise generics through every
// sub-component is noisy and brittle, so we accept a wider form-shape here.
// Field reads are still type-safe via `AnyFieldApi` at the leaf level, and
// field name strings are statically constrained against `CartFormValuesT` keys.
// TODO(typing): tighten when TanStack ships a single-generic alias.
export type CartFormApiT = ReactFormExtendedApi<
  CartFormValuesT,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any, any, any, any, any, any, any, any, any, any, any
>;
