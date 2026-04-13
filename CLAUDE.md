@AGENTS.md

# Project: Chef Personal Brand Website

## Overview

High-end website for a chef with a colorful, Instagram-friendly, vibrant personality. The site extends her Instagram presence and exposes her brand to a wider audience. Secondary goal: sell an ebook.

## Phases

### Phase 1 — Design (current focus)

- Create a clean, beautiful, high-end visual design
- Match the look and feel of the chef's Instagram account
- Reference images will be dropped into `src/app/moodboard/`
- Content is secondary — focus on layout, typography, color, and visual identity

### Phase 2 — Functionality (later)

- Ebook integration and sales
- Other interactive features TBD

## Design Skills

Always use these skills when working on design and styling:

- `taste-skill` — Senior UI/UX architect — use first for architectural decisions - THE MOST IMPORTAN ONE
- `minimalist-skill` — clean editorial-style interfaces
- `brutalist-skill` — raw mechanical interfaces, Swiss typography
- `soft-skill` — high-end soft/warm design language
- `stich-skill` — upgrade existing UI to professional quality

Invoke whichever combination fits the current task. When in doubt, start with `taste-skill` for architectural decisions, then layer in the others.

## Reference Material

All visual references live in `src/app/moodboard/`. Read these before making design decisions.

- `init.md` — site structure, copy (Polish), and content brief from the client
- `ebook_1.webp`, `ebook_2.webp` — **PRIMARY design reference**. The ebook's visual language (color blocking, typography, palette) defines the website's design direction.
- `client-selected-1..11.webp` — images hand-picked by the client as representative of her brand
- `secondary-reference-instagram-1..46.webp` — broader Instagram feed screenshots for mood/context

Priority order for design decisions: ebook style > client-selected > secondary-reference.

## Design Direction (locked)

### Palette (derived from ebook covers)
- Background: Warm off-white `#FDF8F3`
- Primary accent: Coral / red-orange `#E8523A` (ebook cover background)
- Secondary accent: Electric blue `#1B3FE0` (ebook "CAMP FOOD" typography)
- Supporting: Dusty rose `#D4A69A`, Golden `#E8A832`, Sage `#6B8F63`
- Text: Off-black `#1A1614` (warm-tinted)
- Light text (on colored backgrounds): `#FFFFFF`

### Typography
- Headlines: Bold compressed sans-serif (matching ebook's "CAMP FOOD" style), uppercase, tight tracking
- Body: Warm editorial serif for descriptions and longer copy
- Labels/nav/CTAs: Clean sans-serif at small scale

### Visual Language
- Bold color-blocked sections (solid coral or blue backgrounds) alternating with warm off-white
- Asymmetric layouts (DESIGN_VARIANCE: 8)
- Photography as dominant visual — large, full-bleed, hero-scale
- Gallery-style spacing with generous whitespace
- Subtle grain/noise overlay for tactile warmth
- No glassmorphism, no gradients, no glows — tactile and analog
