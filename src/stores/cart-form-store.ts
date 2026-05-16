// sessionStorage-persisted Zustand store for the cart form draft.
// Users can reload or close the dialog without losing typed values; cleared
// on successful submission.
//
// Notes for consumers:
// - Use only inside Client Components (sessionStorage is browser-only).
// - Access via selectors, not destructuring (project React rule).
// - The equality check below assumes JSON-serializable values (strings,
//   numbers, booleans, arrays, plain objects). Date / Map / Set would
//   silently bypass the dedupe.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartFormInputT } from "@/lib/cart-schema";

type CartFormStoreT = {
  formData: CartFormInputT | null;
  updateFormData: (data: CartFormInputT) => void;
  resetFormData: () => void;
};

export const useCartFormStore = create<CartFormStoreT>()(
  persist(
    (set) => ({
      formData: null,
      updateFormData: (data) =>
        set((state) => {
          if (JSON.stringify(state.formData) === JSON.stringify(data))
            return state;
          return { formData: data };
        }),
      resetFormData: () => set({ formData: null }),
    }),
    {
      name: "cart-form",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
