import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartFormValuesT } from "@/lib/cart/cart-schema";

type CartFormStoreT = {
  formData: CartFormValuesT | null;
  updateFormData: (data: CartFormValuesT) => void;
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
