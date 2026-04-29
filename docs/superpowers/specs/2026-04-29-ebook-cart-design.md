# Ebook Cart — Design Spec

Date: 2026-04-29
Status: Draft, ready for review

## Goal

Add a public checkout flow that lets a visitor purchase one of the chef's products
(digital ebook or physical cookbook) without leaving the homepage. The flow ends
by creating a `pending` order in Payload; the chef confirms payment and triggers
fulfillment manually from admin.

## Scope

In scope:

- Two buy CTAs (one per format) that each open a dialog pre-loaded with that product.
- A form inside a framer-motion `Dialog` that captures buyer details, optional
  VAT-invoice details, and shipping address (physical only), with a "use shipping
  as invoice address" toggle for physical orders.
- A server action that creates the order via `payload.create`, upserts the customer
  (merging both shipping and invoice addresses into `customers.addresses[]`), and
  sends an admin notification email.
- A success view inside the same dialog confirming the order number; copy:
  "Odezwę się z danymi do przelewu na {email}".
- A small reusable form kit (FieldShell + styled input/checkbox/select wrappers)
  to avoid duplicating the contact-form's inline boilerplate.
- A Zustand `sessionStorage`-persisted form-state store, mirroring the
  `wykonczymy` `createFormStore<T>(name)` factory pattern, so a buyer who closes
  the dialog mid-fill keeps their typed values when they reopen it.
- Migration of `contact-form.tsx` to the new form kit, so both forms share the
  same `FieldShell` + `FormTextInput` + `FormTextarea` primitives. No behavioural
  change to contact, just a refactor onto the shared components.

Explicitly out of scope:

- Payment provider integration (Stripe / P24 / Tpay / PayU).
- Showing bank-transfer details in the UI; the chef sends them by reply email.

Resolved by design choice (not deferred):

- Marketing consent is not captured in the public form. The `Customers`
  collection's `marketingConsent` field remains admin-managed.
- The cart does not bundle multiple products into one order. One order = one
  product, per the existing `Orders` schema; buying both formats means two
  trips through the dialog.
- VAT invoices are issued by the chef from her own accounting tool, not generated
  by this code.

## Architecture decisions

### Form pattern: raw `useForm` + render-prop wrappers, not `createFormHook`

Mirror the existing `contact-form.tsx` pattern:

```tsx
<form.Field name="email">
  {(field) => <FormTextInput field={field} type="email" placeholder="..." />}
</form.Field>
```

Rationale: the project already uses this pattern and is brand-locked to its own
input styling. Adopting `wykonczymy`'s `createFormHook` + shadcn `<Field>` kit
would mean installing shadcn primitives that conflict with the site's design
system — a high cost to migrate one new form. The render-prop wrappers give us
typed-name access at the call-site without a registered-component context.

### Validation: single Zod schema with `superRefine` for conditionals

A single `cartFormSchema` covers all cases. Conditional requiredness (shipping
fields when `format === "physical"`, invoice fields when `wantsInvoice` is true,
invoice address when `format === "digital" || !useShippingAsInvoice`) is enforced
in a `superRefine` block. Both client (`validators.onSubmit`) and server (server
action `safeParse`) use the same schema. The form state is one flat object; per
the TanStack Form behaviour, unmounted-field values persist in state but are
ignored by the server action when their case doesn't apply.

### Form-state persistence: Zustand + sessionStorage, single shape

Port `wykonczymy`'s generic factory:

```ts
// src/stores/create-form-store.ts
export function createFormStore<TValues>(name: string) {
  return create<{
    formData: TValues | null;
    updateFormData: (data: TValues) => void;
    resetFormData: () => void;
  }>()(
    persist(
      (set) => ({
        formData: null,
        updateFormData: (data) =>
          set((state) =>
            JSON.stringify(state.formData) === JSON.stringify(data)
              ? state
              : { formData: data },
          ),
        resetFormData: () => set({ formData: null }),
      }),
      { name, storage: createJSONStorage(() => sessionStorage) },
    ),
  );
}
```

`useCartFormStore` is a single store with one `CartFormValuesT` shape. When the
dialog opens with a `format`/`productSlug`, we hydrate from the store but
override format-specific fields:

```ts
const initial = storedValues
  ? {
      ...storedValues,
      format,
      productSlug,
      quantity: format === "physical" ? storedValues.quantity || 1 : 1,
    }
  : defaultCartValues(format, productSlug);
```

This preserves cross-format buyer info: email/name/address/invoice details
typed for a physical order are still there if the buyer switches their mind to
digital.

The store is reset (`resetFormData()`) only on successful order creation. A
failed submission keeps the state so the buyer can retry without retyping.
`onChange` flush is debounced at 500 ms via TanStack Form's listener.

### Customer upsert: server action handles addresses directly

The existing `upsertCustomer` hook stays untouched (it remains useful for
admin-created orders using the `_buyer*` shortcut). The cart server action
performs its own customer upsert in `src/lib/orders.ts`, because the cart
flow needs to:

- Push the shipping address into `customers.addresses[]` even when the buyer
  did not request an invoice.
- Push both shipping and invoice addresses (deduped by `line1 + postalCode`)
  when they differ.
- Upgrade an existing address entry with `companyName + nip` when the buyer
  later orders with an invoice request and the previous order didn't include
  those fields.

By handling this in the server action and passing a resolved `customer: id` to
`payload.create`, the existing hook's `_buyerEmail`-gated branch is bypassed
without changes to it.

## File layout

```
src/components/forms/
  field-shell.tsx            ← shared error/aria-describedby wrapper
  form-text-input.tsx        ← FieldShell + styled <input> + bindings
  form-textarea.tsx          ← FieldShell + styled <textarea>
  form-checkbox.tsx          ← styled checkbox + label, no FieldShell
  form-select.tsx            ← FieldShell + styled <select>
  index.ts                   ← barrel export

src/components/sections/cart/
  cart-buy-button.tsx        ← trigger; receives `product`, opens dialog
  cart-dialog.tsx            ← framer-motion Dialog, owns status state
  cart-form.tsx              ← useForm + Zustand + schema + server action
  buyer-fields.tsx           ← email, firstName, lastName, wantsInvoice toggle
  shipping-fields.tsx        ← rendered when format === "physical"
  invoice-fields.tsx         ← rendered when wantsInvoice; nests address
  address-fields.tsx         ← shared block for line1/line2/city/postal/country
  cart-success-view.tsx      ← success state content (rendered inside same Dialog)

src/lib/
  cart-schema.ts             ← Zod schema + CartFormValuesT type
  get-product.ts             ← getProductBySlug() server-only helper
  orders.ts                  ← "use server" — createOrder() server action
                                + upsertCustomerWithAddresses() helper

src/stores/
  create-form-store.ts       ← generic Zustand factory (port from wykonczymy)
  form-stores.ts             ← useCartFormStore export
```

Edited:

```
src/components/sections/contact/
  contact-form.tsx           ← refactored to use the new form kit:
                                inline FieldShell + inputBindings removed,
                                replaced with FormTextInput / FormTextarea
                                from src/components/forms.
                                Behaviour unchanged.
  field-shell.tsx            ← deleted; the local copy is superseded by
                                src/components/forms/field-shell.tsx
```

## Form values

```ts
type CartFormValuesT = {
  format: "digital" | "physical";    // hidden, set from prop
  productSlug: string;                // hidden, set from prop
  email: string;
  firstName: string;
  lastName: string;
  wantsInvoice: boolean;
  quantity: number;                   // physical only (default 1)

  // Shipping — physical only
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;

  // Invoice — when wantsInvoice
  companyName: string;
  nip: string;
  useShippingAsInvoice: boolean;      // physical + wantsInvoice only
  invoiceLine1: string;
  invoiceLine2: string;
  invoiceCity: string;
  invoicePostalCode: string;
  invoiceCountry: string;
};
```

Defaults set in `defaultCartValues(format, productSlug)`:

- `quantity: 1`.
- `wantsInvoice: false`.
- `useShippingAsInvoice: true` (so a physical buyer who toggles `wantsInvoice` does not have to retype their shipping address).
- `*Country: "PL"`.
- All other strings: `""`.

## Field rendering matrix

| Field | digital, no inv | digital + inv | physical, no inv | physical + inv, same | physical + inv, diff |
|---|---|---|---|---|---|
| email, firstName, lastName | ✓ | ✓ | ✓ | ✓ | ✓ |
| `wantsInvoice` toggle | ✓ | ✓ | ✓ | ✓ | ✓ |
| quantity | — | — | ✓ | ✓ | ✓ |
| shipping address | — | — | ✓ | ✓ | ✓ |
| company / NIP | — | ✓ | — | ✓ | ✓ |
| `useShippingAsInvoice` toggle | — | — | — | ✓ (checked) | ✓ (unchecked) |
| invoice address | — | ✓ | — | — | ✓ |

(Digital + invoice has no `useShippingAsInvoice` toggle — there is no shipping
address to copy from.)

## Validation rules (`cartFormSchema.superRefine`)

Always:

- `email` — `z.email().trim()`.
- `firstName`, `lastName` — `.trim().min(1)`.

When `format === "physical"`:

- `shippingLine1` — required.
- `shippingCity` — required.
- `shippingPostalCode` — `/^\d{2}-\d{3}$/`.

When `wantsInvoice === true`:

- `companyName` — required.
- `nip` — `/^\d{10}$/`.
- If `format === "digital" || !useShippingAsInvoice`:
  - `invoiceLine1` — required.
  - `invoiceCity` — required.
  - `invoicePostalCode` — `/^\d{2}-\d{3}$/`.

## Server action contract

```ts
// src/lib/orders.ts — "use server"
export async function createOrder(input: unknown): Promise<
  | { ok: true; orderNumber: string; totalGross: number }
  | { ok: false; error: string }
>;
```

Behaviour:

1. `cartFormSchema.safeParse(input)` — return `{ ok: false, error: "Nieprawidłowe dane" }` on failure.
2. `payload.find({ collection: "products", where: { slug, active: true }, limit: 1, depth: 0 })` to resolve the product.
3. Verify `product.format === input.format`. Mismatch returns `{ ok: false, error: "Nieprawidłowy format" }`.
4. Build `addressesToAdd` per the table below.
5. `customerId = await upsertCustomerWithAddresses(payload, email, firstName, lastName, addressesToAdd)`.
6. `payload.create({ collection: "orders", data: { product: product.id, customer: customerId, quantity, wantsInvoice, shippingAddress } })` — `shippingAddress` only for physical; the existing `snapshotOrder` hook does VAT/totals; `generateOrderNumber` produces `orderNumber`.
7. `sendEmail` to the chef (`ENV.EMAIL_TO`) with order summary so she can follow up with payment instructions.
8. Return `{ ok: true, orderNumber: order.orderNumber, totalGross: order.totalGross }`.

### `addressesToAdd` per case

| Case | `addressesToAdd[]` |
|---|---|
| digital, no invoice | `[]` |
| digital + invoice | `[{ companyName, nip, line1, line2, city, postalCode, country }]` (from `invoice*` fields) |
| physical, no invoice | `[{ line1, line2, city, postalCode, country }]` (from `shipping*` fields) |
| physical + invoice, same | `[{ companyName, nip, line1, line2, city, postalCode, country }]` (from `shipping*` fields, single merged entry) |
| physical + invoice, different | `[{ line1, line2, city, postalCode, country }, { companyName, nip, line1, line2, city, postalCode, country }]` (shipping then invoice) |

### `upsertCustomerWithAddresses` semantics

- Find by email. If missing, `payload.create` with `addressesToAdd`.
- If found, merge into existing `customer.addresses` deduped by
  `line1 + postalCode`. If a new entry has `nip` and the matched existing entry
  doesn't, upgrade the existing entry's `companyName` + `nip` in place. Only
  call `payload.update` if the merged list changed.
- Return the customer id.

## Dialog state machine

State lives in `cart-dialog.tsx`:

```ts
type StatusT = "form" | "submitting" | "success" | "error";
```

- `"form"` — initial state when opened. Form rendered.
- `"submitting"` — fields disabled, submit button shows "Wysyłanie…", `aria-busy`.
- `"success"` — content swaps to `<CartSuccessView orderNumber={...} email={...} />` inside the same Dialog. Curtain stays open.
- `"error"` — form rendered, error banner above submit, user can retry. The Zustand store still has the values.

Closing the dialog from any state resets `status` back to `"form"`. The dialog
unmounts from the React tree on close (managed by `AnimatePresence`).

## Buy button

```tsx
<CartBuyButton product={cookbookDigital} label="Kup ebook" variant="coral-solid" />
<CartBuyButton product={cookbookPhysical} label="Kup książkę" variant="blue-solid" />
```

`product` is fetched server-side at page render via `getProductBySlug(slug)` and
passed as a prop. If the product is missing or `active: false`, the button does
not render. Where the buttons are placed on the page is intentionally left to
the chef / designer and is out of scope for this spec.

## Success view

Visual language mirrors `ContactSuccessDialog`:

- `bg-yellow` curtain.
- `Starburst` accent.
- `ScatterText` heading: "Dziękuję!".
- Body lines:
  - `Zamówienie {orderNumber}`.
  - `Odezwę się z danymi do przelewu na {email}`.
- Close button: "Zamknij", clears the success state.

## Admin notification email

Sent inside `createOrder` after the order is created:

```
to:      ENV.EMAIL_TO
subject: Nowe zamówienie {orderNumber}
text: |
  Zamówienie: {orderNumber}
  Produkt:    {product.title} ({product.format})
  Ilość:      {quantity}
  Kwota:      {totalGross} PLN
  Klient:     {firstName} {lastName} <{email}>
  Faktura:    {companyName} (NIP {nip})           ← only if wantsInvoice
  Adres dostawy: {shipping line summary}           ← only if physical
  Adres faktury: {invoice line summary}            ← only if invoice address differs from shipping
```

## Known limitations / non-goals

- Buyer cannot specify "different invoice name" beyond `companyName` (the chef's
  invoices are issued to the company on file). Personal-name VAT invoices are
  uncommon for ebook sales and are not supported in v1.
- No coupon / discount codes.
- No abandoned-cart recovery — sessionStorage persistence only helps within the
  same browser session.
- A buyer can place duplicate orders (no idempotency key). The chef can resolve
  manually if needed.

## Verification

- Manual test: buy each format (digital, physical), with and without invoice,
  with both `useShippingAsInvoice` settings. Verify order shape in admin and
  customer addresses merging correctly across two consecutive purchases by the
  same email.
- Form persistence test: type half a form, close dialog, reopen — values
  retained. Submit successfully — store cleared on next reopen.
- Dialog test: ESC closes from form state; ESC closes from success state.
- Submit a malformed payload via curl directly to the server action — confirm
  the schema rejects and no order is created.
- Smoke-test the contact form after the kit migration: submit a valid message,
  confirm the success dialog shows; submit an invalid email, confirm the same
  inline error message appears as before.
