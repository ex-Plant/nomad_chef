# Email Templating System — Design

**Date:** 2026-05-11
**Status:** Approved (brainstorm)

## Goal

Replace plain-text-only automatic emails with branded HTML templates. Provide a dev-only preview surface so templates are easy to adjust. Include the project logo in every automatic email.

## Non-goals

- No React Email, no new email-rendering deps.
- No dark mode support.
- No CMS-editable email content (templates stay as code).
- No tracking, no analytics, no A/B variants.
- No template registry / discovery abstraction.

## Constraints

- Existing send path is `payload.sendEmail` (nodemailer adapter). `sendEmail` in `src/lib/email.ts` already accepts optional `html` — no signature change required.
- Filenames kebab-case, exported functions camelCase, types suffixed `T` (per `~/.claude/rules/code_style.md`).
- Use locked palette from `CLAUDE.md` only (Coral `#DE6445`, Blue `#193EF4`, Warm white `#F5EEE5`, Off-black `#1A1614`).

## Architecture

### Module layout

```
src/lib/emails/
  constants.ts              # EMAIL_COLORS, LOGO_URL helper, EmailItemT union
  render-shell.ts           # renderEmailShell({ title, items, footer }) → string
  templates/
    order-confirmation.ts   # generateOrderConfirmationHtml(args) → string
    contact-message.ts      # generateContactMessageHtml(args) → string

public/email/
  logo.png                  # one-time copy of src/assets/logo.png

src/app/email-previews/
  page.tsx                  # dev-only preview UI (no route group → no site layout)
```

This mirrors the working moodbox structure (`src/utilities/email_templates/` → templates + a render function) but renames the top-level directory to `lib/emails/` to match the existing `src/lib/` convention.

### Render shell

`renderEmailShell` is a pure function: takes `{ title, items, footer }`, returns an HTML string with:

- `<!DOCTYPE html>` + viewport meta
- Body: `EMAIL_COLORS.warmWhite` background, `Arial, sans-serif`
- Centered 600px card on `EMAIL_COLORS.card` (#FFFFFF), 8px radius, 30px padding
- Logo header: `<img>` (centered, `height=40`, explicit `width`) → `${SITE_URL}/email/logo.png`
- Optional title (H1, off-black, centered)
- Item list rendered from `EmailItemT` union (`text` | `button` | `raw`)
- Optional footer (small, centered, coral)

The `EmailItemT` union is the same shape as moodbox:

```ts
export type EmailItemT =
  | { type: "text"; content: string; bold?: boolean; marginBottom?: string }
  | { type: "button"; label: string; url: string }
  | { type: "raw"; html: string };
```

Coral (`#DE6445`) is the button background; button text uses `#FFFFFF`. No other color blocking — keeps email-client rendering predictable.

### Logo handling

- One-time copy of `src/assets/logo.png` to `public/email/logo.png`. No build step, no transform.
- `LOGO_URL` helper reads `process.env.NEXT_PUBLIC_SITE_URL ?? "https://nomadchef.pl"` (matches pattern in `src/app/sitemap.ts`, `src/app/robots.ts`, `src/collections/orders/hooks/digital-fulfillment.ts`).
- `<img>` tag uses explicit `width`/`height` (Outlook requires) and `alt="Marta Leśniewska — Chaos Kitchen"`.

### Template functions

Each template is a plain function that builds `EmailItemT[]` from typed args and calls `renderEmailShell`.

**`generateOrderConfirmationHtml`** — args: order number, product title + format, quantity, total gross, customer first/last name, customer email, optional invoice block (company name + NIP). Renders title `"Nowe zamówienie ${orderNumber}"`, then rows of bold-labeled text items, then optional invoice line.

**`generateContactMessageHtml`** — args: sender email, message. Renders title `"Wiadomość z formularza"`, message paragraph (or `"(brak wiadomości)"` fallback), sender line.

Both templates return a string. No async work.

### Wire-in

- `src/lib/orders/send-order-confirmation.ts` — pass `html: generateOrderConfirmationHtml({...})` alongside existing `text: buildOrderEmailText(...)`. No other changes to retry/status logic.
- `src/lib/email.ts` `sendContactEmail` — pass `html: generateContactMessageHtml({...})` alongside existing `text`.

Plain-text body stays as a fallback (better deliverability, supports non-HTML clients).

### Preview page

- Path: `src/app/email-previews/page.tsx`. Top-level, no route group, so the site `(site)` layout (nav/footer) does NOT wrap the preview iframe.
- Client component. First line in component body:
  ```ts
  if (process.env.NODE_ENV !== "development") notFound();
  ```
  In production builds, `process.env.NODE_ENV` is statically `"production"`, so this returns 404 unconditionally — no runtime exposure.
- UI: header bar with template `<select>` dropdown + "Copy HTML" button; main area is full-height `<iframe srcDoc={html}>`.
- Fixture data declared at top of file as `const` objects (one per template). Editing fixtures + saving triggers Fast Refresh → new HTML in iframe.

## Data flow

```
[server send path]
  sendOrderConfirmation / sendContactEmail
    → generateXxxHtml(typedArgs)
       → renderEmailShell({ title, items, footer })
          → string
    → sendEmail({ to, subject, text, html })
       → payload.sendEmail (nodemailer)

[dev preview]
  /email-previews
    → fixture args
    → generateXxxHtml(fixtureArgs)
       → string
    → <iframe srcDoc={html}>
```

The send path and the preview path call the **same** generator function. There is no second rendering path — what you see in the preview is what the recipient receives.

## Error handling

- Templates are pure string functions. No I/O, no throws.
- `sendOrderConfirmation` already wraps `sendEmail` in try/catch and updates email status on the order. Adding `html` does not change that flow.
- `sendContactEmail` propagates errors to the caller (current behavior). No change.
- Logo image: if `${SITE_URL}/email/logo.png` 404s in some env, recipients see the `alt` text. Acceptable — fail open.

## Testing

- No unit tests added. The render functions are pure and trivial; the preview page is the verification surface.
- Manual verification:
  1. `pnpm dev` → open `http://localhost:3000/email-previews` → switch templates in dropdown → confirm both render with logo, title, button, footer.
  2. Trigger contact form locally → check inbox, confirm HTML version renders with logo.
  3. Trigger an order locally → check `EMAIL_TO` inbox, confirm order-confirmation HTML renders.
- Production verification: confirm `NEXT_PUBLIC_SITE_URL` is set on Vercel (already required by sitemap/robots).

## Files touched

**New:**

- `src/lib/emails/constants.ts`
- `src/lib/emails/render-shell.ts`
- `src/lib/emails/templates/order-confirmation.ts`
- `src/lib/emails/templates/contact-message.ts`
- `public/email/logo.png` (copy of `src/assets/logo.png`)
- `src/app/email-previews/page.tsx`

**Modified:**

- `src/lib/email.ts` — `sendContactEmail` adds `html` argument
- `src/lib/orders/send-order-confirmation.ts` — adds `html` argument to `sendEmail` call

## YAGNI cuts

- No React Email, no `@react-email/components` dep, no `npx react-email dev` server.
- No dark mode CSS.
- No template registry / dynamic discovery — preview page hardcodes the two templates.
- No live editable form in the preview (fixtures only). Fast Refresh on file save is enough.
- No image fingerprinting / cache-busting for the logo URL.
- No retry-aware idempotency keys (not using Resend).
