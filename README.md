# Chaos Kitchen — Chef Personal Brand Website

High-end personal-brand site for a chef (chaoskitchen.pl). Single-page scrolling
experience that extends her Instagram presence, plus an integrated ebook store
(cart → Przelewy24 payment → digital fulfilment → email + gated download).

- **Production:** https://www.chaoskitchen.pl (apex `chaoskitchen.pl` 307 → www)
- **Admin (Payload):** `/admin`

## Tech stack

| Concern        | Choice                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router) — see [`AGENTS.md`](AGENTS.md)                  |
| CMS / backend  | Payload 3 (`@payloadcms/next`), mounted under `src/app/(payload)`      |
| Database       | Postgres — local Docker for dev, Neon in prod (`@payloadcms/db-vercel-postgres`) |
| Media storage  | Vercel Blob (`@payloadcms/storage-vercel-blob`)                        |
| Email          | Nodemailer via Payload adapter (SMTP `mail.chaoskitchen.pl`)           |
| Payments       | Przelewy24 (P24) — see [`docs/przelewy24.md`](docs/przelewy24.md)      |
| Forms / schema | TanStack Form + Zod                                                     |
| Animation      | GSAP (`ScrollTrigger`) + Framer Motion                                 |
| Styling        | Tailwind CSS 4, Radix primitives                                       |
| Hosting        | Vercel project `nomad-chef`                                            |

## Prerequisites

- Node 24 (project runs on v24.x; no version file is pinned)
- Docker (for the local Postgres container)
- A filled-in `.env` (copy from [`.env.example`](.env.example))

## Getting started

```bash
# 1. Install deps
npm install

# 2. Configure env (then fill in the blanks — Blob token, SMTP, P24 keys)
cp .env.example .env

# 3. Start the local Postgres container (chef-cms, port 5434)
npm run db:up

# 4. Apply Payload migrations to the fresh DB
npm run migrate

# 5. Run the dev server
npm run dev
```

App: http://localhost:3000 · Admin: http://localhost:3000/admin

To work against a copy of production data, dump from Neon and import locally:

```bash
npm run db:dump     # pg_dump prod (PROD_DB_POSTGRES_URL) → dumps/dump-latest.sql
npm run db:import   # load dumps/dump-latest.sql into the local container
```

## Scripts

| Script                  | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`           | Next dev server                                                               |
| `npm run build`         | `payload generate:importmap && generate:types && migrate && next build`       |
| `npm run start`         | Production server (after `build`)                                             |
| `npm run lint`          | ESLint                                                                         |
| `npm run typecheck`     | `tsc --noEmit`                                                                 |
| `npm run format[:fix]`  | Prettier check / write                                                         |
| `npm test`              | Unit tests (`node:test` + tsx) under `tests/`                                  |
| `npm run test:e2e`      | Playwright e2e (CI-safe default gate)                                          |
| `npm run test:e2e:all`  | Playwright incl. `@manual` live-P24 specs (`E2E_ALL=1`)                        |
| `npm run migrate`       | Apply Payload migrations · `migrate:create` to author a new one               |
| `npm run db:up/down`    | Start / stop the local Postgres container                                     |
| `npm run db:dump/import`| Snapshot prod DB / load a dump locally                                         |

## Project structure

```
src/
  app/
    (site)/         Public site: home, checkout/processing, download/[token], legal pages
    (payload)/      Payload admin (/admin) + Payload REST API
    api/            p24/webhook, cron/reconcile-payments, download/[token], test-email
  collections/      Payload collections (see below)
  globals/          site.ts — the Site global (hero, sections, content)
  components/       sections/, shared/, ui/, forms/, debug-tools/
  config/           env.ts (boot-validated vars), payments.ts, content.ts, section-ids.ts
  lib/              cart, checkout, orders, payments, emails, cms, contact, newsletter
  migrations/       Payload DB migrations
```

**Payload collections:** `users`, `customers`, `orders`, `products`,
`digital-assets`, `media`, `legal-pages`, `newsletter-subscribers`.
**Globals:** `site`.

## Environment variables

All boot-required vars are validated in [`src/config/env.ts`](src/config/env.ts) —
a missing one fails the build/boot fast. Read them via `ENV.X`, never
`process.env` directly. See [`.env.example`](.env.example) for the full annotated
list. Summary:

- **Database:** `DB_POSTGRES_URL` (+ `POSTGRES_*`, `DOCKER_CONTAINER`, `PROD_DB_POSTGRES_URL` for the DB scripts)
- **Payload:** `PAYLOAD_SECRET`
- **Media:** `BLOB_READ_WRITE_TOKEN`
- **Email (SMTP):** `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`
- **Site:** `SITE_URL` (canonical prod URL — drives sitemap, robots, OG, order/email links)
- **Przelewy24:** `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY` (+ optional `P24_SANDBOX`)
- **Cron:** `CRON_SECRET` (guards payment reconciliation; prod-only, not boot-required)

## Payments & fulfilment

The ebook purchase flow (cart → P24 paywall → webhook/PULL settlement → digital
fulfilment → download email → gated download) is documented in full, including
P24's credential gotchas and the IP-whitelist `401` trap:

➡ **[`docs/przelewy24.md`](docs/przelewy24.md)** — integration, credentials, going live, local ngrok testing.

End-to-end test coverage, the layered test strategy, and the audit findings:

➡ **[`docs/purchase-flow-test-findings.md`](docs/purchase-flow-test-findings.md)**

## Documentation index

| Doc                                                                                  | What it covers                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [`CLAUDE.md`](CLAUDE.md)                                                              | Project brief, **locked design direction** (palette, type, layout)  |
| [`AGENTS.md`](AGENTS.md)                                                              | Next.js version caveat — read the bundled docs before coding        |
| [`docs/przelewy24.md`](docs/przelewy24.md)                                            | Przelewy24 payment integration (authoritative)                      |
| [`docs/purchase-flow-test-findings.md`](docs/purchase-flow-test-findings.md)         | Purchase-flow e2e coverage & findings                               |
| [`docs/mobile-full-height.md`](docs/mobile-full-height.md)                           | iOS Safari mobile Services parallax debugging log                   |
| [`src/components/sections/hero/HERO_VIDEO_OPTIMIZATION.md`](src/components/sections/hero/HERO_VIDEO_OPTIMIZATION.md) | Hero video shipped setup + encoding notes |

## Deployment

Hosted on Vercel (project `nomad-chef`). `main` deploys to production. Set the
production env vars in the Vercel project — including `P24_SANDBOX=false`,
`SITE_URL=https://www.chaoskitchen.pl`, and a strong `CRON_SECRET`. The build
runs Payload migrations automatically (`npm run build`). The payment
reconciliation cron (`/api/cron/reconcile-payments`) is scheduled in
`vercel.json` and runs on production deployments only.
