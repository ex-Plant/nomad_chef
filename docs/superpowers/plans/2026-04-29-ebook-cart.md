# Ebook Cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public ebook/cookbook checkout flow — two buy CTAs open a dialog with buyer + shipping + invoice fields, submission creates a `pending` order in Payload, chef confirms payment manually.

**Architecture:** TanStack Form + Zod schema with `superRefine` for conditional validation. Zustand sessionStorage store for form persistence (factory ported from `wykonczymy`). Reusable form kit (`FieldShell`, `FormTextInput`, `FormTextarea`, `FormCheckbox`, `FormSelect`) so cart and contact forms share primitives. Custom framer-motion `Dialog` with form/success state machine. Server action handles customer upsert with shipping+invoice address merging, bypassing the existing `_buyer*` hook path.

**Tech Stack:** Next.js 16 App Router, TypeScript, TanStack Form 1.29, Zod 4, Zustand 5 (persist + sessionStorage), Payload 3.83, framer-motion, Tailwind, `node:test` + `tsx`.

**Spec:** `docs/superpowers/specs/2026-04-29-ebook-cart-design.md`.

**Process rule:** After every task's commit, run the `simplify` skill against the diff. Address any issues it flags before moving on.

---

## File structure

**New files (created across tasks):**

```
src/components/forms/field-shell.tsx          # Task 1
src/components/forms/form-text-input.tsx      # Task 1
src/components/forms/form-textarea.tsx        # Task 1
src/components/forms/form-checkbox.tsx        # Task 1
src/components/forms/form-select.tsx          # Task 1
src/components/forms/index.ts                 # Task 1

src/stores/create-form-store.ts               # Task 2
src/stores/form-stores.ts                     # Task 2 (extended in Task 3)

src/lib/cart-schema.ts                        # Task 3
src/lib/cart-schema.test.ts                   # Task 3
src/lib/get-product.ts                        # Task 4
src/lib/orders.ts                             # Task 5
src/lib/orders.test.ts                        # Task 5

src/components/sections/cart/buyer-fields.tsx     # Task 6
src/components/sections/cart/address-fields.tsx   # Task 6
src/components/sections/cart/shipping-fields.tsx  # Task 7
src/components/sections/cart/invoice-fields.tsx   # Task 7
src/components/sections/cart/cart-form.tsx        # Task 8
src/components/sections/cart/cart-success-view.tsx # Task 9
src/components/sections/cart/cart-dialog.tsx      # Task 9
src/components/sections/cart/cart-buy-button.tsx  # Task 10
```

**Modified files:**

```
package.json                                       # Task 3 (test script glob)
src/app/(site)/page.tsx                            # Task 10 (temporary buy-button placement for smoke test)
src/components/sections/contact/contact-form.tsx   # Task 11 (migrate to form kit)
src/components/sections/contact/field-shell.tsx    # Task 11 (deleted)
```

---

## Task 1: Form kit primitives

**Files:**
- Create: `src/components/forms/field-shell.tsx`
- Create: `src/components/forms/form-text-input.tsx`
- Create: `src/components/forms/form-textarea.tsx`
- Create: `src/components/forms/form-checkbox.tsx`
- Create: `src/components/forms/form-select.tsx`
- Create: `src/components/forms/index.ts`

- [ ] **Step 1: Create `field-shell.tsx`**

```tsx
import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

type FieldShellPropsT = {
  field: AnyFieldApi;
  children: ReactNode;
};

export function FieldShell({ field, children }: FieldShellPropsT) {
  const errors = field.state.meta.errors;
  const hasErrors = errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <div className="relative h-fit">
      {children}
      {hasErrors && (
        <p id={errorId} role="alert" className="mt-1 px-1 text-sm text-coral">
          {errors
            .map((e) => (typeof e === "string" ? e : (e?.message ?? "")))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `form-text-input.tsx`**

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const inputClasses =
  "w-full rounded-md border border-coral bg-yellow px-4 py-2.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60";

type FormTextInputPropsT = {
  field: AnyFieldApi;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormTextInput({
  field,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  ariaLabel,
  className,
  disabled,
}: FormTextInputPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  const value =
    type === "number"
      ? Number.isFinite(field.state.value) ? String(field.state.value) : ""
      : (field.state.value as string) ?? "";
  return (
    <FieldShell field={field}>
      <input
        type={type}
        name={field.name}
        id={field.name}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => {
          if (type === "number") {
            const raw = e.target.value;
            const parsed = raw === "" ? "" : Number(raw);
            field.handleChange(parsed === "" || Number.isNaN(parsed) ? 0 : parsed);
            return;
          }
          field.handleChange(e.target.value);
        }}
        className={cn(inputClasses, className)}
      />
    </FieldShell>
  );
}
```

- [ ] **Step 3: Create `form-textarea.tsx`**

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const textareaClasses =
  "w-full rounded-md border border-coral bg-yellow px-4 py-2.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60 min-h-24 resize-none field-sizing-content";

type FormTextareaPropsT = {
  field: AnyFieldApi;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormTextarea({
  field,
  placeholder,
  rows = 4,
  ariaLabel,
  className,
  disabled,
}: FormTextareaPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      <textarea
        name={field.name}
        id={field.name}
        rows={rows}
        value={(field.state.value as string) ?? ""}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(textareaClasses, className)}
      />
    </FieldShell>
  );
}
```

- [ ] **Step 4: Create `form-checkbox.tsx`**

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "@/helpers/cn";

type FormCheckboxPropsT = {
  field: AnyFieldApi;
  label: string;
  className?: string;
  disabled?: boolean;
};

export function FormCheckbox({
  field,
  label,
  className,
  disabled,
}: FormCheckboxPropsT) {
  const checked = Boolean(field.state.value);
  return (
    <label
      htmlFor={field.name}
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none font-sans text-sm text-off-black",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      <input
        type="checkbox"
        id={field.name}
        name={field.name}
        checked={checked}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-coral"
      />
      <span>{label}</span>
    </label>
  );
}
```

- [ ] **Step 5: Create `form-select.tsx`**

```tsx
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { FieldShell } from "./field-shell";
import { cn } from "@/helpers/cn";

const selectClasses =
  "w-full rounded-md border border-coral bg-yellow px-4 py-2.5 font-sans text-sm text-off-black transition-colors duration-300 ease-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral disabled:opacity-60";

type FormSelectPropsT = {
  field: AnyFieldApi;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormSelect({
  field,
  children,
  ariaLabel,
  className,
  disabled,
}: FormSelectPropsT) {
  const hasErrors = field.state.meta.errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <FieldShell field={field}>
      <select
        name={field.name}
        id={field.name}
        value={(field.state.value as string) ?? ""}
        aria-label={ariaLabel}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(selectClasses, className)}
      >
        {children}
      </select>
    </FieldShell>
  );
}
```

- [ ] **Step 6: Create `index.ts` barrel**

```ts
export { FieldShell } from "./field-shell";
export { FormTextInput } from "./form-text-input";
export { FormTextarea } from "./form-textarea";
export { FormCheckbox } from "./form-checkbox";
export { FormSelect } from "./form-select";
```

- [ ] **Step 7: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/components/forms`
Expected: no errors. Fix anything reported.

- [ ] **Step 8: Commit**

```bash
git add src/components/forms
git commit -m "feat(forms): add reusable TanStack Form field kit"
```

- [ ] **Step 9: Run simplify on this task's changes**

Invoke: `Skill(simplify)` against the diff of this task. Address any reuse / quality / efficiency issues it flags. If fixes are made, commit them as `refactor(forms): simplify field kit per simplify skill`.

---

## Task 2: Zustand form-store factory

**Files:**
- Create: `src/stores/create-form-store.ts`
- Create: `src/stores/form-stores.ts` *(placeholder; cart store added in Task 3 once `CartFormValuesT` exists)*

- [ ] **Step 1: Create `create-form-store.ts`**

```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FormStoreT<TValues> = {
  formData: TValues | null;
  updateFormData: (data: TValues) => void;
  resetFormData: () => void;
};

export function createFormStore<TValues>(name: string) {
  return create<FormStoreT<TValues>>()(
    persist(
      (set) => ({
        formData: null,
        updateFormData: (data) =>
          set((state) => {
            if (JSON.stringify(state.formData) === JSON.stringify(data)) return state;
            return { formData: data };
          }),
        resetFormData: () => set({ formData: null }),
      }),
      {
        name,
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
}
```

- [ ] **Step 2: Create empty `form-stores.ts`**

```ts
// Form-state stores. Each public form has its own sessionStorage-persisted store
// so users can reload or close a dialog without losing typed values.
// Cleared on successful submission.
export {};
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/create-form-store.ts src/stores/form-stores.ts
git commit -m "feat(stores): add generic Zustand form-store factory"
```

- [ ] **Step 5: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(stores): simplify form-store factory per simplify skill`.

---

## Task 3: Cart schema with TDD

**Files:**
- Create: `src/lib/cart-schema.ts`
- Create: `src/lib/cart-schema.test.ts`
- Modify: `package.json` (test script glob)
- Modify: `src/stores/form-stores.ts` (now that the type exists)

- [ ] **Step 1: Update `package.json` test script**

Replace the existing line:
```json
"test": "node --import tsx --test src/lib/billing.test.ts"
```
with:
```json
"test": "node --import tsx --test src/lib/*.test.ts"
```

Run: `npm test`
Expected: existing `billing.test.ts` still passes via the glob.

- [ ] **Step 2: Write failing test file `src/lib/cart-schema.test.ts`**

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cartFormSchema, defaultCartValues } from "./cart-schema";

const valid = {
  format: "digital" as const,
  productSlug: "cookbook-digital",
  email: "anna@test.local",
  firstName: "Anna",
  lastName: "Kowalska",
  wantsInvoice: false,
  quantity: 1,
  shippingLine1: "",
  shippingLine2: "",
  shippingCity: "",
  shippingPostalCode: "",
  shippingCountry: "PL",
  companyName: "",
  nip: "",
  useShippingAsInvoice: true,
  invoiceLine1: "",
  invoiceLine2: "",
  invoiceCity: "",
  invoicePostalCode: "",
  invoiceCountry: "PL",
};

describe("defaultCartValues", () => {
  it("returns digital defaults", () => {
    const v = defaultCartValues("digital", "cookbook-digital");
    assert.equal(v.format, "digital");
    assert.equal(v.productSlug, "cookbook-digital");
    assert.equal(v.quantity, 1);
    assert.equal(v.wantsInvoice, false);
    assert.equal(v.useShippingAsInvoice, true);
    assert.equal(v.shippingCountry, "PL");
    assert.equal(v.invoiceCountry, "PL");
  });
});

describe("cartFormSchema — digital, no invoice", () => {
  it("accepts a minimal valid digital order", () => {
    const r = cartFormSchema.safeParse(valid);
    assert.equal(r.success, true);
  });

  it("rejects bad email", () => {
    const r = cartFormSchema.safeParse({ ...valid, email: "not-an-email" });
    assert.equal(r.success, false);
  });

  it("rejects empty firstName", () => {
    const r = cartFormSchema.safeParse({ ...valid, firstName: "" });
    assert.equal(r.success, false);
  });

  it("does NOT require shipping for digital", () => {
    const r = cartFormSchema.safeParse({
      ...valid,
      shippingLine1: "",
      shippingCity: "",
      shippingPostalCode: "",
    });
    assert.equal(r.success, true);
  });
});

describe("cartFormSchema — digital + invoice", () => {
  const base = {
    ...valid,
    wantsInvoice: true,
    companyName: "Smaki Sp. z o.o.",
    nip: "5252352342",
    invoiceLine1: "Al. Jerozolimskie 100",
    invoiceCity: "Warszawa",
    invoicePostalCode: "02-001",
  };

  it("accepts a complete digital invoice order", () => {
    const r = cartFormSchema.safeParse(base);
    assert.equal(r.success, true);
  });

  it("rejects missing companyName", () => {
    const r = cartFormSchema.safeParse({ ...base, companyName: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed NIP (9 digits)", () => {
    const r = cartFormSchema.safeParse({ ...base, nip: "123456789" });
    assert.equal(r.success, false);
  });

  it("rejects missing invoice address", () => {
    const r = cartFormSchema.safeParse({ ...base, invoiceLine1: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed invoice postal code", () => {
    const r = cartFormSchema.safeParse({ ...base, invoicePostalCode: "00001" });
    assert.equal(r.success, false);
  });
});

describe("cartFormSchema — physical, no invoice", () => {
  const base = {
    ...valid,
    format: "physical" as const,
    productSlug: "cookbook-physical",
    quantity: 2,
    shippingLine1: "ul. Klonowa 5",
    shippingCity: "Warszawa",
    shippingPostalCode: "00-001",
  };

  it("accepts a physical order with shipping", () => {
    const r = cartFormSchema.safeParse(base);
    assert.equal(r.success, true);
  });

  it("rejects missing shipping line1", () => {
    const r = cartFormSchema.safeParse({ ...base, shippingLine1: "" });
    assert.equal(r.success, false);
  });

  it("rejects malformed shipping postal", () => {
    const r = cartFormSchema.safeParse({ ...base, shippingPostalCode: "00001" });
    assert.equal(r.success, false);
  });
});

describe("cartFormSchema — physical + invoice", () => {
  const base = {
    ...valid,
    format: "physical" as const,
    productSlug: "cookbook-physical",
    quantity: 1,
    shippingLine1: "ul. Klonowa 5",
    shippingCity: "Warszawa",
    shippingPostalCode: "00-001",
    wantsInvoice: true,
    companyName: "Smaki Sp. z o.o.",
    nip: "5252352342",
  };

  it("accepts when useShippingAsInvoice is true and invoice address is empty", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: true,
      invoiceLine1: "",
      invoiceCity: "",
      invoicePostalCode: "",
    });
    assert.equal(r.success, true);
  });

  it("rejects when useShippingAsInvoice is false and invoice address is empty", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: false,
      invoiceLine1: "",
      invoiceCity: "",
      invoicePostalCode: "",
    });
    assert.equal(r.success, false);
  });

  it("accepts when useShippingAsInvoice is false and invoice address is provided", () => {
    const r = cartFormSchema.safeParse({
      ...base,
      useShippingAsInvoice: false,
      invoiceLine1: "Al. Jerozolimskie 100",
      invoiceCity: "Warszawa",
      invoicePostalCode: "02-001",
    });
    assert.equal(r.success, true);
  });
});
```

- [ ] **Step 3: Run test, expect failure**

Run: `npm test`
Expected: FAIL — `Cannot find module './cart-schema'`.

- [ ] **Step 4: Implement `src/lib/cart-schema.ts`**

```ts
import { z } from "zod";

const POSTAL_CODE_RE = /^\d{2}-\d{3}$/;
const NIP_RE = /^\d{10}$/;

export const cartFormSchema = z
  .object({
    format: z.enum(["digital", "physical"]),
    productSlug: z.string().min(1),
    email: z.email().trim(),
    firstName: z.string().trim().min(1, "Wymagane"),
    lastName: z.string().trim().min(1, "Wymagane"),
    wantsInvoice: z.boolean(),
    quantity: z.number().int().min(1).max(99),
    shippingLine1: z.string().trim(),
    shippingLine2: z.string().trim(),
    shippingCity: z.string().trim(),
    shippingPostalCode: z.string().trim(),
    shippingCountry: z.string().trim(),
    companyName: z.string().trim(),
    nip: z.string().trim(),
    useShippingAsInvoice: z.boolean(),
    invoiceLine1: z.string().trim(),
    invoiceLine2: z.string().trim(),
    invoiceCity: z.string().trim(),
    invoicePostalCode: z.string().trim(),
    invoiceCountry: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.format === "physical") {
      if (!data.shippingLine1)
        ctx.addIssue({ path: ["shippingLine1"], code: "custom", message: "Wymagane" });
      if (!data.shippingCity)
        ctx.addIssue({ path: ["shippingCity"], code: "custom", message: "Wymagane" });
      if (!POSTAL_CODE_RE.test(data.shippingPostalCode))
        ctx.addIssue({ path: ["shippingPostalCode"], code: "custom", message: "Format: 00-000" });
    }
    if (data.wantsInvoice) {
      if (!data.companyName)
        ctx.addIssue({ path: ["companyName"], code: "custom", message: "Wymagane" });
      if (!NIP_RE.test(data.nip))
        ctx.addIssue({ path: ["nip"], code: "custom", message: "10 cyfr" });
      const needsInvoiceAddress =
        data.format === "digital" || !data.useShippingAsInvoice;
      if (needsInvoiceAddress) {
        if (!data.invoiceLine1)
          ctx.addIssue({ path: ["invoiceLine1"], code: "custom", message: "Wymagane" });
        if (!data.invoiceCity)
          ctx.addIssue({ path: ["invoiceCity"], code: "custom", message: "Wymagane" });
        if (!POSTAL_CODE_RE.test(data.invoicePostalCode))
          ctx.addIssue({ path: ["invoicePostalCode"], code: "custom", message: "Format: 00-000" });
      }
    }
  });

export type CartFormValuesT = z.infer<typeof cartFormSchema>;

export function defaultCartValues(
  format: "digital" | "physical",
  productSlug: string,
): CartFormValuesT {
  return {
    format,
    productSlug,
    email: "",
    firstName: "",
    lastName: "",
    wantsInvoice: false,
    quantity: 1,
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "PL",
    companyName: "",
    nip: "",
    useShippingAsInvoice: true,
    invoiceLine1: "",
    invoiceLine2: "",
    invoiceCity: "",
    invoicePostalCode: "",
    invoiceCountry: "PL",
  };
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test`
Expected: PASS — all `cart-schema` tests + the existing `billing` tests.

- [ ] **Step 6: Wire up `useCartFormStore` in `form-stores.ts`**

Replace the file contents:
```ts
import { createFormStore } from "./create-form-store";
import type { CartFormValuesT } from "@/lib/cart-schema";

export const useCartFormStore = createFormStore<CartFormValuesT>("cart-form");
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json src/lib/cart-schema.ts src/lib/cart-schema.test.ts src/stores/form-stores.ts
git commit -m "feat(cart): add cart form schema with conditional validation"
```

- [ ] **Step 9: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify cart schema per simplify skill`.

---

## Task 4: Product fetcher

**Files:**
- Create: `src/lib/get-product.ts`

- [ ] **Step 1: Create `get-product.ts`**

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product } from "@/payload-types";

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "products",
    where: {
      slug: { equals: slug },
      active: { equals: true },
    },
    limit: 1,
    depth: 1,
  });
  return docs[0] ?? null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/get-product.ts
git commit -m "feat(cart): add server-only product-by-slug helper"
```

- [ ] **Step 4: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify get-product per simplify skill`.

---

## Task 5: Server action `createOrder` with TDD'd customer-merge helper

**Files:**
- Create: `src/lib/orders.ts`
- Create: `src/lib/orders.test.ts`

The `upsertCustomerWithAddresses` helper has a tricky merge rule (dedupe by `line1+postalCode`, upgrade existing entries with `companyName/nip`). We extract that pure-function logic and TDD it.

- [ ] **Step 1: Write failing test `src/lib/orders.test.ts`**

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeAddresses, type AddressT } from "./orders";

const baseShipping: AddressT = {
  line1: "ul. Klonowa 5",
  line2: "",
  city: "Warszawa",
  postalCode: "00-001",
  country: "PL",
};

const sameShippingWithCompany: AddressT = {
  ...baseShipping,
  companyName: "Smaki Sp. z o.o.",
  nip: "5252352342",
};

const otherInvoice: AddressT = {
  companyName: "Smaki Sp. z o.o.",
  nip: "5252352342",
  line1: "Al. Jerozolimskie 100",
  line2: "",
  city: "Warszawa",
  postalCode: "02-001",
  country: "PL",
};

describe("mergeAddresses", () => {
  it("returns existing list unchanged when nothing to add", () => {
    const { merged, changed } = mergeAddresses([baseShipping], []);
    assert.equal(changed, false);
    assert.deepEqual(merged, [baseShipping]);
  });

  it("appends a new address that does not match by line1+postalCode", () => {
    const { merged, changed } = mergeAddresses([baseShipping], [otherInvoice]);
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
    assert.deepEqual(merged[1], otherInvoice);
  });

  it("does not duplicate identical address (same line1+postalCode, no nip)", () => {
    const { merged, changed } = mergeAddresses([baseShipping], [baseShipping]);
    assert.equal(changed, false);
    assert.equal(merged.length, 1);
  });

  it("upgrades existing entry when new entry has companyName+nip and existing does not", () => {
    const { merged, changed } = mergeAddresses(
      [baseShipping],
      [sameShippingWithCompany],
    );
    assert.equal(changed, true);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].companyName, "Smaki Sp. z o.o.");
    assert.equal(merged[0].nip, "5252352342");
  });

  it("does not overwrite existing companyName/nip with new values", () => {
    const existing: AddressT = {
      ...baseShipping,
      companyName: "OldCo",
      nip: "1111111111",
    };
    const incoming: AddressT = {
      ...baseShipping,
      companyName: "NewCo",
      nip: "9999999999",
    };
    const { merged, changed } = mergeAddresses([existing], [incoming]);
    assert.equal(changed, false);
    assert.equal(merged[0].companyName, "OldCo");
    assert.equal(merged[0].nip, "1111111111");
  });

  it("merges multiple new entries against multiple existing", () => {
    const { merged, changed } = mergeAddresses(
      [baseShipping],
      [baseShipping, otherInvoice],
    );
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
  });

  it("starts from an empty list", () => {
    const { merged, changed } = mergeAddresses([], [baseShipping, otherInvoice]);
    assert.equal(changed, true);
    assert.equal(merged.length, 2);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test`
Expected: FAIL — `Cannot find module './orders'`.

- [ ] **Step 3: Implement `src/lib/orders.ts`**

```ts
"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { ENV } from "@/config/env";
import { sendEmail } from "@/lib/email";
import { cartFormSchema, type CartFormValuesT } from "@/lib/cart-schema";

export type AddressT = {
  companyName?: string;
  nip?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export function mergeAddresses(
  existing: AddressT[],
  toAdd: AddressT[],
): { merged: AddressT[]; changed: boolean } {
  const merged = [...existing];
  let changed = false;
  for (const next of toAdd) {
    const idx = merged.findIndex(
      (a) => a.line1 === next.line1 && a.postalCode === next.postalCode,
    );
    if (idx === -1) {
      merged.push(next);
      changed = true;
      continue;
    }
    if (next.nip && !merged[idx].nip) {
      merged[idx] = {
        ...merged[idx],
        companyName: next.companyName ?? merged[idx].companyName,
        nip: next.nip,
      };
      changed = true;
    }
  }
  return { merged, changed };
}

function buildAddressesToAdd(v: CartFormValuesT): AddressT[] {
  const addresses: AddressT[] = [];
  const shipping: AddressT | null =
    v.format === "physical"
      ? {
          line1: v.shippingLine1,
          line2: v.shippingLine2 || undefined,
          city: v.shippingCity,
          postalCode: v.shippingPostalCode,
          country: v.shippingCountry || "PL",
        }
      : null;
  const invoice: AddressT | null = v.wantsInvoice
    ? {
        companyName: v.companyName,
        nip: v.nip,
        line1:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingLine1
            : v.invoiceLine1,
        line2:
          (v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingLine2
            : v.invoiceLine2) || undefined,
        city:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingCity
            : v.invoiceCity,
        postalCode:
          v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingPostalCode
            : v.invoicePostalCode,
        country:
          (v.format === "physical" && v.useShippingAsInvoice
            ? v.shippingCountry
            : v.invoiceCountry) || "PL",
      }
    : null;
  if (
    v.format === "physical" &&
    v.wantsInvoice &&
    v.useShippingAsInvoice &&
    invoice
  ) {
    addresses.push(invoice);
    return addresses;
  }
  if (shipping) addresses.push(shipping);
  if (invoice) addresses.push(invoice);
  return addresses;
}

type CreateOrderResultT =
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResultT> {
  const parsed = cartFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Nieprawidłowe dane" };
  const v = parsed.data;

  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: "products",
    where: {
      slug: { equals: v.productSlug },
      active: { equals: true },
    },
    limit: 1,
    depth: 0,
  });
  const product = products.docs[0];
  if (!product) return { ok: false, error: "Produkt niedostępny" };
  if (product.format !== v.format) return { ok: false, error: "Nieprawidłowy format" };

  const addressesToAdd = buildAddressesToAdd(v);

  const existingCustomers = await payload.find({
    collection: "customers",
    where: { email: { equals: v.email } },
    limit: 1,
    depth: 0,
  });
  let customerId: string | number;
  if (!existingCustomers.docs[0]) {
    const created = await payload.create({
      collection: "customers",
      data: {
        email: v.email,
        firstName: v.firstName,
        lastName: v.lastName,
        addresses: addressesToAdd,
      },
    });
    customerId = created.id;
  } else {
    const existing = existingCustomers.docs[0];
    const { merged, changed } = mergeAddresses(
      (existing.addresses ?? []) as AddressT[],
      addressesToAdd,
    );
    if (changed) {
      await payload.update({
        collection: "customers",
        id: existing.id,
        data: { addresses: merged },
      });
    }
    customerId = existing.id;
  }

  const shippingAddressForOrder =
    v.format === "physical"
      ? {
          firstName: v.firstName,
          lastName: v.lastName,
          line1: v.shippingLine1,
          line2: v.shippingLine2 || undefined,
          city: v.shippingCity,
          postalCode: v.shippingPostalCode,
          country: v.shippingCountry || "PL",
        }
      : undefined;

  const order = await payload.create({
    collection: "orders",
    data: {
      product: product.id,
      customer: customerId,
      quantity: v.format === "physical" ? v.quantity : 1,
      wantsInvoice: v.wantsInvoice,
      shippingAddress: shippingAddressForOrder,
    },
  });

  await sendEmail({
    to: ENV.EMAIL_TO,
    subject: `Nowe zamówienie ${order.orderNumber}`,
    text: [
      `Zamówienie: ${order.orderNumber}`,
      `Produkt: ${product.title} (${product.format})`,
      `Ilość: ${order.quantity}`,
      `Kwota: ${order.totalGross} PLN`,
      `Klient: ${v.firstName} ${v.lastName} <${v.email}>`,
      v.wantsInvoice ? `Faktura: ${v.companyName} (NIP ${v.nip})` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return {
    ok: true,
    orderNumber: order.orderNumber!,
    totalGross: order.totalGross,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS — all `mergeAddresses` cases.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `payload-types.ts` reports a `customer.addresses` shape mismatch (Payload generates strict shapes), cast `addressesToAdd` to the generated type at the `payload.create`/`update` call sites. Do not loosen `AddressT`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/orders.ts src/lib/orders.test.ts
git commit -m "feat(cart): add createOrder server action with customer-address merge"
```

- [ ] **Step 7: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify orders module per simplify skill`.

---

## Task 6: Buyer + address sub-components

**Files:**
- Create: `src/components/sections/cart/buyer-fields.tsx`
- Create: `src/components/sections/cart/address-fields.tsx`

These are leaves used by Tasks 7+. They take the `form` instance as a prop and render their slice.

- [ ] **Step 1: Create `address-fields.tsx`**

```tsx
"use client";

import type { ReactFormApi, AnyFieldApi } from "@tanstack/react-form";
import type { CartFormValuesT } from "@/lib/cart-schema";
import { FormTextInput } from "@/components/forms";

type AddressFieldsPropsT = {
  form: ReactFormApi<CartFormValuesT, never>;
  prefix: "shipping" | "invoice";
  disabled?: boolean;
};

export function AddressFields({ form, prefix, disabled }: AddressFieldsPropsT) {
  const line1Name = `${prefix}Line1` as const;
  const line2Name = `${prefix}Line2` as const;
  const cityName = `${prefix}City` as const;
  const postalName = `${prefix}PostalCode` as const;
  const countryName = `${prefix}Country` as const;
  return (
    <div className="flex flex-col gap-3">
      <form.Field name={line1Name}>
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            placeholder="Ulica i numer"
            autoComplete={prefix === "shipping" ? "shipping address-line1" : "billing address-line1"}
            disabled={disabled}
          />
        )}
      </form.Field>
      <form.Field name={line2Name}>
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            placeholder="Lokal / dodatkowo (opcjonalne)"
            autoComplete={prefix === "shipping" ? "shipping address-line2" : "billing address-line2"}
            disabled={disabled}
          />
        )}
      </form.Field>
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <form.Field name={cityName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              placeholder="Miasto"
              autoComplete={prefix === "shipping" ? "shipping address-level2" : "billing address-level2"}
              disabled={disabled}
            />
          )}
        </form.Field>
        <form.Field name={postalName}>
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              placeholder="00-000"
              autoComplete={prefix === "shipping" ? "shipping postal-code" : "billing postal-code"}
              disabled={disabled}
            />
          )}
        </form.Field>
      </div>
      <form.Field name={countryName}>
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            placeholder="Kraj"
            autoComplete={prefix === "shipping" ? "shipping country-name" : "billing country-name"}
            disabled={disabled}
          />
        )}
      </form.Field>
    </div>
  );
}
```

- [ ] **Step 2: Create `buyer-fields.tsx`**

```tsx
"use client";

import type { ReactFormApi, AnyFieldApi } from "@tanstack/react-form";
import type { CartFormValuesT } from "@/lib/cart-schema";
import { FormTextInput, FormCheckbox } from "@/components/forms";

type BuyerFieldsPropsT = {
  form: ReactFormApi<CartFormValuesT, never>;
  disabled?: boolean;
};

export function BuyerFields({ form, disabled }: BuyerFieldsPropsT) {
  return (
    <div className="flex flex-col gap-3">
      <form.Field name="email">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            type="email"
            placeholder="E-mail"
            autoComplete="email"
            disabled={disabled}
          />
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstName">
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              placeholder="Imię"
              autoComplete="given-name"
              disabled={disabled}
            />
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              placeholder="Nazwisko"
              autoComplete="family-name"
              disabled={disabled}
            />
          )}
        </form.Field>
      </div>
      <form.Field name="wantsInvoice">
        {(field: AnyFieldApi) => (
          <FormCheckbox field={field} label="Chcę fakturę VAT" disabled={disabled} />
        )}
      </form.Field>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If TanStack Form's `ReactFormApi` generic shape differs in v1.29, replace the import with the actual exported form-instance type. Reference `src/components/sections/contact/contact-form.tsx` for the working signature.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/cart/buyer-fields.tsx src/components/sections/cart/address-fields.tsx
git commit -m "feat(cart): add buyer and address field sub-components"
```

- [ ] **Step 5: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify buyer/address fields per simplify skill`.

---

## Task 7: Shipping + invoice sub-components

**Files:**
- Create: `src/components/sections/cart/shipping-fields.tsx`
- Create: `src/components/sections/cart/invoice-fields.tsx`

- [ ] **Step 1: Create `shipping-fields.tsx`**

```tsx
"use client";

import type { ReactFormApi, AnyFieldApi } from "@tanstack/react-form";
import type { CartFormValuesT } from "@/lib/cart-schema";
import { FormTextInput } from "@/components/forms";
import { AddressFields } from "./address-fields";

type ShippingFieldsPropsT = {
  form: ReactFormApi<CartFormValuesT, never>;
  disabled?: boolean;
};

export function ShippingFields({ form, disabled }: ShippingFieldsPropsT) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-xs uppercase tracking-wide text-coral">
        Adres dostawy
      </p>
      <form.Field name="quantity">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            type="number"
            placeholder="Ilość"
            inputMode="numeric"
            disabled={disabled}
            className="max-w-[8rem]"
          />
        )}
      </form.Field>
      <AddressFields form={form} prefix="shipping" disabled={disabled} />
    </div>
  );
}
```

- [ ] **Step 2: Create `invoice-fields.tsx`**

```tsx
"use client";

import type { ReactFormApi, AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";
import type { CartFormValuesT } from "@/lib/cart-schema";
import { FormTextInput, FormCheckbox } from "@/components/forms";
import { AddressFields } from "./address-fields";

type InvoiceFieldsPropsT = {
  form: ReactFormApi<CartFormValuesT, never>;
  disabled?: boolean;
};

export function InvoiceFields({ form, disabled }: InvoiceFieldsPropsT) {
  const format = useStore(form.store, (s) => s.values.format);
  const useShippingAsInvoice = useStore(
    form.store,
    (s) => s.values.useShippingAsInvoice,
  );
  const showInvoiceAddress =
    format === "digital" || !useShippingAsInvoice;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-xs uppercase tracking-wide text-coral">
        Dane do faktury
      </p>
      <form.Field name="companyName">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            placeholder="Nazwa firmy"
            autoComplete="organization"
            disabled={disabled}
          />
        )}
      </form.Field>
      <form.Field name="nip">
        {(field: AnyFieldApi) => (
          <FormTextInput
            field={field}
            placeholder="NIP (10 cyfr)"
            inputMode="numeric"
            disabled={disabled}
            className="max-w-[12rem]"
          />
        )}
      </form.Field>
      {format === "physical" && (
        <form.Field name="useShippingAsInvoice">
          {(field: AnyFieldApi) => (
            <FormCheckbox
              field={field}
              label="Adres faktury jest taki sam jak dostawy"
              disabled={disabled}
            />
          )}
        </form.Field>
      )}
      {showInvoiceAddress && (
        <AddressFields form={form} prefix="invoice" disabled={disabled} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/cart/shipping-fields.tsx src/components/sections/cart/invoice-fields.tsx
git commit -m "feat(cart): add shipping and invoice field-group components"
```

- [ ] **Step 5: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify shipping/invoice fields per simplify skill`.

---

## Task 8: `CartForm` orchestrator

**Files:**
- Create: `src/components/sections/cart/cart-form.tsx`

- [ ] **Step 1: Create `cart-form.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useCartFormStore } from "@/stores/form-stores";
import { cartFormSchema, defaultCartValues, type CartFormValuesT } from "@/lib/cart-schema";
import { createOrder } from "@/lib/orders";
import { Button } from "@/components/shared/button";
import type { Product } from "@/payload-types";
import { BuyerFields } from "./buyer-fields";
import { ShippingFields } from "./shipping-fields";
import { InvoiceFields } from "./invoice-fields";

type CartFormPropsT = {
  product: Product;
  onSuccess: (orderNumber: string, email: string) => void;
};

export function CartForm({ product, onSuccess }: CartFormPropsT) {
  const storedValues = useCartFormStore((s) => s.formData);
  const updateFormData = useCartFormStore((s) => s.updateFormData);
  const resetFormData = useCartFormStore((s) => s.resetFormData);

  const initialValues = useMemo<CartFormValuesT>(() => {
    const defaults = defaultCartValues(
      product.format as "digital" | "physical",
      product.slug,
    );
    if (!storedValues) return defaults;
    return {
      ...storedValues,
      format: defaults.format,
      productSlug: defaults.productSlug,
      quantity: defaults.format === "physical" ? storedValues.quantity || 1 : 1,
    };
    // initialValues is captured once by useForm; we intentionally do not
    // reactively re-initialize as the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: cartFormSchema },
    listeners: {
      onChange: ({ formApi }) => updateFormData(formApi.state.values as CartFormValuesT),
      onChangeDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      const result = await createOrder(value);
      if (result.ok) {
        resetFormData();
        form.reset();
        onSuccess(result.orderNumber, value.email);
      }
      return result;
    },
  });

  const wantsInvoice = useStore(form.store, (s) => s.values.wantsInvoice);
  const isPhysical = product.format === "physical";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col gap-1 text-off-black">
        <p className="font-sans text-xs uppercase tracking-wide text-coral">
          {isPhysical ? "Książka" : "Ebook"}
        </p>
        <h3 className="font-display text-2xl">{product.title}</h3>
        <p className="font-sans text-sm">
          {product.priceGross} PLN
        </p>
      </header>

      <BuyerFields form={form} />
      {isPhysical && <ShippingFields form={form} />}
      {wantsInvoice && <InvoiceFields form={form} />}

      <form.Subscribe
        selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="compact"
              variant="coral-solid"
              disabled={!canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Wysyłanie…" : "Złóż zamówienie"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `useForm`'s generics don't infer `CartFormValuesT` correctly, set the explicit generic via `useForm<CartFormValuesT>({...})`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/cart/cart-form.tsx
git commit -m "feat(cart): add CartForm orchestrator with Zustand persistence"
```

- [ ] **Step 4: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify CartForm per simplify skill`.

---

## Task 9: `CartDialog` + `CartSuccessView`

**Files:**
- Create: `src/components/sections/cart/cart-success-view.tsx`
- Create: `src/components/sections/cart/cart-dialog.tsx`

- [ ] **Step 1: Create `cart-success-view.tsx`**

```tsx
"use client";

import { Button } from "@/components/shared/button";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";

type CartSuccessViewPropsT = {
  orderNumber: string;
  email: string;
  onClose: () => void;
};

export function CartSuccessView({
  orderNumber,
  email,
  onClose,
}: CartSuccessViewPropsT) {
  return (
    <div className="relative h-full w-full">
      <div className="relative flex flex-col items-center gap-4 p-12 text-center text-white">
        <ScatterText
          as="h2"
          triggerOnMount
          className="text-heading-lg text-white bg-coral -rotate-1 py-1 pr-4 pl-1"
          lines={[{ text: "Dziękuję!" }]}
        />
        <div className="font-sans text-sm md:text-base flex flex-col items-center gap-1">
          <p className="bg-coral text-white w-fit">
            Zamówienie {orderNumber}
          </p>
          <p className="bg-coral text-white w-fit">
            Odezwę się z danymi do przelewu na {email}
          </p>
        </div>
        <Button onClick={onClose} variant="coral" size="compact">
          Zamknij
        </Button>
      </div>
      <Starburst
        color="pink"
        variant="logo-c"
        size="sm"
        className="absolute -top-4 left-0 md:-top-16 md:-left-16 z-1"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `cart-dialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { Product } from "@/payload-types";
import { CartForm } from "./cart-form";
import { CartSuccessView } from "./cart-success-view";

type StatusT =
  | { kind: "form" }
  | { kind: "success"; orderNumber: string; email: string };

type CartDialogPropsT = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
};

export function CartDialog({ product, isOpen, onClose }: CartDialogPropsT) {
  const [status, setStatus] = useState<StatusT>({ kind: "form" });

  function handleClose() {
    onClose();
    // Reset to "form" so that the next time the dialog opens it shows the
    // form, not the previous success view. AnimatePresence covers the
    // exit animation, so reset is safe to do synchronously.
    setStatus({ kind: "form" });
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Zamówienie"
      className="bg-yellow"
    >
      <div className="w-[min(90vw,32rem)] rounded-lg bg-yellow p-6 md:p-8">
        {status.kind === "form" && (
          <CartForm
            product={product}
            onSuccess={(orderNumber, email) =>
              setStatus({ kind: "success", orderNumber, email })
            }
          />
        )}
        {status.kind === "success" && (
          <CartSuccessView
            orderNumber={status.orderNumber}
            email={status.email}
            onClose={handleClose}
          />
        )}
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/cart/cart-dialog.tsx src/components/sections/cart/cart-success-view.tsx
git commit -m "feat(cart): add CartDialog state machine + success view"
```

- [ ] **Step 5: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify cart dialog per simplify skill`.

---

## Task 10: `CartBuyButton` + temporary placement + manual smoke test

**Files:**
- Create: `src/components/sections/cart/cart-buy-button.tsx`
- Modify: `src/app/(site)/page.tsx` (temporary placement at the bottom of the page so we can smoke-test the flow end to end)

- [ ] **Step 1: Create `cart-buy-button.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import type { Product } from "@/payload-types";
import { CartDialog } from "./cart-dialog";

type CartBuyButtonPropsT = {
  product: Product | null;
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

export function CartBuyButton({
  product,
  label,
  variant = "coral-solid",
  size = "default",
  className,
}: CartBuyButtonPropsT) {
  const [isOpen, setIsOpen] = useState(false);
  if (!product) return null;
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
      <CartDialog
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

- [ ] **Step 2: Add temporary placement in `src/app/(site)/page.tsx`**

Read the existing page first (`src/app/(site)/page.tsx`). At the top of the file, add the imports:

```tsx
import { getProductBySlug } from "@/lib/get-product";
import { CartBuyButton } from "@/components/sections/cart/cart-buy-button";
```

Make the page component `async` if it isn't already, and inside it fetch both products in parallel:

```tsx
const [digital, physical] = await Promise.all([
  getProductBySlug("cookbook-digital"),
  getProductBySlug("cookbook-physical"),
]);
```

Render the buttons in a temporary fixed-position panel near the end of the JSX (so designers will see it but it won't disrupt the existing layout):

```tsx
<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
  <CartBuyButton product={digital} label="Kup ebook" variant="coral-solid" size="compact" />
  <CartBuyButton product={physical} label="Kup książkę" variant="blue-solid" size="compact" />
</div>
```

This placement is a smoke-test affordance only; final placement is a follow-up design task.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/components/sections/cart src/app/\(site\)/page.tsx`
Expected: no errors.

- [ ] **Step 4: Manual smoke test — start the dev server**

Make sure the database has the seeded products. If not, run:
```bash
npx tsx src/scripts/seed-orders.ts
```

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:3000`. Verify both buttons appear bottom-right.

- [ ] **Step 5: Manual smoke test — happy path matrix**

For each row of the matrix below: click the relevant button, fill the form, submit. After each submission verify in Payload admin (`http://localhost:3000/admin/collections/orders`) that the order exists with the right shape, and the customer in `customers` has the expected addresses array.

| Case | Button | wantsInvoice | useShippingAsInvoice | Expected order | Expected customer.addresses |
|---|---|---|---|---|---|
| 1 | Kup ebook | off | n/a | digital, qty 1, no shipping | empty (or unchanged) |
| 2 | Kup ebook | on | n/a | digital, qty 1, no shipping, wantsInvoice=true | one entry with companyName/nip |
| 3 | Kup książkę | off | n/a | physical, qty>=1, shippingAddress populated | one entry, no companyName/nip |
| 4 | Kup książkę | on | true | physical, qty>=1, shippingAddress populated, wantsInvoice=true | one entry with companyName/nip + shipping fields |
| 5 | Kup książkę | on | false (different invoice address) | physical, shippingAddress populated, wantsInvoice=true | two entries (shipping + invoice) |

For each successful submission: confirm the success view shows "Zamówienie {orderNumber}" and the email; confirm the chef-facing notification email lands in your `EMAIL_TO` inbox.

- [ ] **Step 6: Manual smoke test — validation**

- Submit with bad email: form blocks, inline error appears.
- Submit physical with empty city: form blocks.
- Submit with NIP "123": form blocks with "10 cyfr".
- Type half a form, close the dialog (X / overlay click / ESC), reopen — fields preserved (Zustand sessionStorage).
- Submit successfully, then reopen the same button — fields cleared (resetFormData fired on success).

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/cart/cart-buy-button.tsx 'src/app/(site)/page.tsx'
git commit -m "feat(cart): add CartBuyButton + temp homepage placement for smoke testing"
```

- [ ] **Step 8: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(cart): simplify cart buy button per simplify skill`.

---

## Task 11: Migrate `contact-form.tsx` to the form kit

**Files:**
- Modify: `src/components/sections/contact/contact-form.tsx`
- Delete: `src/components/sections/contact/field-shell.tsx`

- [ ] **Step 1: Replace contact-form.tsx body**

Replace the entire file with:
```tsx
"use client";

import { useState } from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema } from "@/lib/contact-schema";
import { FormTextInput, FormTextarea } from "@/components/forms";
import { Button } from "@/components/shared/button";
import { Dialog } from "@/components/ui/dialog";
import { Starburst } from "@/components/shared/starburst";
import { ScatterText } from "@/components/shared/scatter-text";

type ContactFormPropsT = {
  messagePlaceholder: string;
  submitLabel: string;
};

export function ContactForm({
  messagePlaceholder,
  submitLabel,
}: ContactFormPropsT) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const form = useForm({
    defaultValues: { email: "", message: "" },
    validators: { onSubmit: contactFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendContactEmail(value);
        setStatus("success");
        form.reset();
      } catch {
        setStatus("error");
      }
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="flex flex-col gap-3"
      >
        <form.Field name="email">
          {(field: AnyFieldApi) => (
            <FormTextInput
              field={field}
              type="email"
              placeholder="Twój e-mail..."
              autoComplete="email"
            />
          )}
        </form.Field>
        <form.Field name="message">
          {(field: AnyFieldApi) => (
            <FormTextarea field={field} placeholder={messagePlaceholder} rows={4} />
          )}
        </form.Field>
        <form.Subscribe
          selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <div className="mt-1 flex flex-col gap-2">
              <Button
                type="submit"
                size="compact"
                variant="coral-solid"
                disabled={!canSubmit}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Wysyłanie…" : submitLabel}
              </Button>
              {status === "error" && (
                <p role="alert" className="text-sm text-coral">
                  Coś poszło nie tak. Spróbuj ponownie.
                </p>
              )}
            </div>
          )}
        </form.Subscribe>
      </form>

      <Dialog
        isOpen={status === "success"}
        onClose={() => setStatus("idle")}
        ariaLabel="Wiadomość wysłana"
        className="bg-coral"
      >
        <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
          <Starburst
            color="pink"
            variant="logo-c"
            className="absolute -top-24 right-0 w-24 opacity-90 md:-top-32 md:w-32"
            rotate
          />
          <ScatterText
            as="h2"
            triggerOnMount
            className="text-heading-lg"
            lines={[{ text: "Dziękuję!" }]}
          />
          <p className="max-w-[320px] font-sans text-sm sm:max-w-sm sm:text-base md:max-w-lg">
            Wiadomość już do mnie leci. Odezwę się tak szybko, jak to możliwe.
          </p>
          <Button
            onClick={() => setStatus("idle")}
            variant="yellow"
            size="compact"
          >
            Zamknij
          </Button>
        </div>
      </Dialog>
    </>
  );
}
```

The inline `FieldShell` and `inputBindings` are gone; both fields now go through the shared kit.

- [ ] **Step 2: Delete the local field-shell**

```bash
git rm src/components/sections/contact/field-shell.tsx
```

If it is referenced anywhere else, run:
```bash
grep -r "sections/contact/field-shell" src/
```
Expected: no results. If anything other than `contact-form.tsx` referenced it, update the import to `@/components/forms`.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src/components/sections/contact`
Expected: no errors.

- [ ] **Step 4: Manual smoke test — contact form**

Run the dev server and visit the contact section.
- Submit a valid message → success dialog appears.
- Submit with invalid email → inline error.
- Submit with empty message → schema may allow (existing behavior); confirm parity with pre-migration behavior.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/contact/contact-form.tsx
git commit -m "refactor(contact): migrate contact form onto shared form kit"
```

- [ ] **Step 6: Run simplify**

Invoke `Skill(simplify)`. Commit any fixes as `refactor(contact): simplify per simplify skill`.

---

## Self-review

**Spec coverage:**
- Form kit primitives → Task 1.
- Zustand store factory → Task 2.
- Cart schema with `superRefine` conditionals → Task 3.
- Server-side product fetcher → Task 4.
- Server action `createOrder` + customer-address merging → Task 5.
- Buyer/shipping/invoice/address sub-components → Tasks 6, 7.
- `CartForm` orchestrator with Zustand persistence → Task 8.
- `CartDialog` + `CartSuccessView` state machine → Task 9.
- `CartBuyButton` + manual smoke-test matrix → Task 10.
- Contact-form migration → Task 11.
- Admin notification email → inside Task 5's `createOrder`.
- `simplify` after every step → final step of every task (Steps 9, 5, 9, 4, 7, 5, 5, 4, 5, 8, 6 across tasks 1–11).

**Placeholder scan:** No "TBD" / "TODO" / "fill in details" — every code block is concrete.

**Type consistency:** `CartFormValuesT` flows from `cart-schema.ts` (Task 3) through `form-stores.ts` (Task 3) into `cart-form.tsx` (Task 8) and the field components (Tasks 6, 7). `AddressT` defined in `orders.ts` (Task 5) and used internally in the test (Task 5). No mismatched names.

**Out of scope (per spec):** payment provider, bank-detail UI. Final placement of buy buttons in the page layout is also a follow-up — Task 10 only places them in a fixed-position smoke-test panel.
