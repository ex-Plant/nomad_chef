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

### Palette

Primary (section backgrounds, key UI):

- Coral-orange: `#DE6445` (rgb 222/100/69)
- Electric blue: `#193EF4` (rgb 25/62/244)
- Warm white: `#F5EEE5` (rgb 245/238/229)

Secondary (can also be used as section backgrounds):

- Pink: `#F3B1E3` (rgb 243/177/227)
- Yellow: `#E5F55D` (rgb 229/245/93)

Text:

- Off-black `#1A1614` on light backgrounds
- `#FFFFFF` on coral-orange and blue backgrounds

Rule: No colors outside this system. Tint/shade these five for variants.

### Typography

- Headlines: Bold compressed sans-serif (matching ebook's "CAMP FOOD" style), uppercase, tight tracking
- Body: Warm editorial serif for descriptions and longer copy
- Labels/nav/CTAs: Clean sans-serif at small scale

### Visual Language

**Scroll color zones** (reference: https://zooom.framer.website/):

- Each major section occupies full viewport height with one of the three primary background colors
- Scrolling creates a color journey — white → coral → blue → white → coral, etc.
- Text and UI flip to high-contrast counterparts per zone

**Navigation** (reference: design-5 floating nav):

- Floating pill-shaped nav that appears on scroll
- Tracks and highlights the currently visible section
- See `src/components/design-5/floating-nav.tsx` for interaction pattern

**Hero** (reference: design-5 parallax hero):

- Large parallax hero with scroll-based image scaling
- Needs a strong real photo — TBD
- See `src/components/design-5/hero-section.tsx` for motion pattern

**Gallery** (reference: design-1 masonry grid):

- Uneven/organic masonry grid — CSS columns, not a rigid equal-height grid
- Varied image sizes create visual rhythm
- See `src/components/design-1/gallery.tsx` for layout shape

**Photography**:

- Real photos from `src/app/moodboard/` only — client-selected and Instagram content
- No stock photos, no placeholders, no picsum
- Photography is the dominant visual — large, full-bleed, hero-scale

**General**:

- Asymmetric layouts (DESIGN_VARIANCE: 8)
- Gallery-style spacing with generous whitespace
- Subtle grain/noise overlay for tactile warmth
- No glassmorphism, no gradients, no glows — tactile and analog
