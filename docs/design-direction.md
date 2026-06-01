# Design Direction (locked)

Read this before any visual, UI, or styling work. The design system below is
**locked** — it's the distilled source of truth for the site's look and feel.

## Design Skills

Always use these skills when working on design and styling:

- `taste-skill` — Senior UI/UX architect — use first for architectural decisions. **The most important one.**
- `minimalist-skill` — clean editorial-style interfaces
- `soft-skill` — high-end soft/warm design language
- `stitch-skill` — upgrade existing UI to professional quality

Invoke whichever combination fits the current task. When in doubt, start with `taste-skill` for architectural decisions, then layer in the others.

## Palette

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

## Typography

- Headlines: Bold compressed sans-serif (matching ebook's "CAMP FOOD" style), uppercase, tight tracking
- Body: Warm editorial serif for descriptions and longer copy
- Labels/nav/CTAs: Clean sans-serif at small scale

## Visual Language

**Scroll color zones** (reference: https://zooom.framer.website/):

- Each major section occupies full viewport height with one of the three primary background colors
- Scrolling creates a color journey — white → coral → blue → white → coral, etc.
- Text and UI flip to high-contrast counterparts per zone

**Layout & treatment**:

- Asymmetric layouts; gallery-style spacing with generous whitespace
- Galleries use an uneven/organic masonry (CSS columns) with varied image sizes — never a rigid equal-height grid
- Subtle grain/noise overlay for tactile warmth
- No glassmorphism, no gradients, no glows — tactile and analog
