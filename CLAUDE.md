@AGENTS.md

## Commit Policy

Operating under cover — do NOT add `Co-Authored-By: Claude` or any other AI co-author trailer to commit messages. Commit messages must look fully human-authored.

## Diagnostics

For read-only checks against the local database, run `psql` directly via the Docker container instead of writing one-off tsx scripts. The Postgres container is `chef-cms`, user `chef`, db `chef`. Example: `docker exec chef-cms psql -U chef -d chef -c "SELECT ..."`. Only write a tsx script when the check truly needs the Payload runtime (e.g. to call hooks or test cache layers).

## Deployment

- **Production domain (canonical):** `https://www.chaoskitchen.pl` — apex `chaoskitchen.pl` returns 307 → www.
- **Vercel project:** `nomad-chef` under team `eggplants-projects-07c20257`.
- Any absolute origin (links, OG image, sitemap, email URLs, P24 callbacks) must read `SITE_URL` via `ENV.SITE_URL` — never hardcode the domain or paste a Vercel preview/deployment URL. In production `SITE_URL` is the canonical `https://www.chaoskitchen.pl`.

# Project: Chef Personal Brand Website

## Overview

High-end website for a chef with a colorful, Instagram-friendly, vibrant personality. The site extends her Instagram presence and exposes her brand to a wider audience. Secondary goal: sell an ebook.

## Status

Both the visual design and the ebook commerce flow are **built and live in
production**. Work now is iteration, polish, and maintenance — not greenfield.

- **Design** — the site's visual identity is shipped. See "Design Direction (locked)" below.
- **Commerce** — ebook cart → Przelewy24 payment → digital fulfilment → download
  email → gated download is fully implemented, tested, and live. See
  [`docs/przelewy24.md`](docs/przelewy24.md) and
  [`docs/purchase-flow-test-findings.md`](docs/purchase-flow-test-findings.md).

## Design

Doing visual, UI, or styling work? Read [`docs/design-direction.md`](docs/design-direction.md)
first — it holds the locked design system (palette, typography, visual language)
and the design-skill workflow. Don't make visual changes without it.
