// Form-state stores. Each form gets its own sessionStorage-persisted store
// so users can reload or close a dialog without losing typed values.
// Cleared on successful submission.
//
// Notes for consumers:
// - Use only inside Client Components (sessionStorage is browser-only).
// - Access via selectors, not destructuring (project React rule).
// - The factory's JSON.stringify equality check assumes plain JSON-serializable
//   values (strings, numbers, booleans, arrays, plain objects). Date / Map / Set
//   values would silently bypass the dedupe.

import { createFormStore } from "./create-form-store";
import type { CartFormValuesT } from "@/lib/cart-schema";

export const useCartFormStore = createFormStore<CartFormValuesT>("cart-form");
