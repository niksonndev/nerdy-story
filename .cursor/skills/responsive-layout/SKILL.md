---
name: responsive-layout
description: >-
  Defines how the nerdy-story story reader adapts across mobile, tablet, and
  desktop. Mobile-first breakpoints, image aspect-ratio crop rule, modal and
  Next Page placement. Use when styling layout, breakpoints, viewport,
  responsive CSS/Tailwind, image containers, modal sizing, button placement,
  or making story screens fit phone/tablet/desktop.
---

# Responsive Layout

Layout and breakpoints only. Look and feel: [kid-friendly-ui-design](../kid-friendly-ui-design/SKILL.md). Interaction: [storybook-interaction-design](../storybook-interaction-design/SKILL.md). Motion: [motion-animation](../motion-animation/SKILL.md). Product scope lives in `.cursor/rules/product-mvp.mdc`.

## Purpose
Defines how the story reader adapts across mobile, tablet, and desktop.
Mobile-first: base styles target mobile, then progressively enhanced upward.
Other skills (motion-animation, storybook-interaction-design) reference
these breakpoints rather than defining their own.

## Breakpoints
- Mobile: 0–639px (base/default styles, no media query needed)
- Tablet: 640px–1023px
- Desktop: 1024px+

## Image container rule
One image asset per screen. The container crops it via `object-fit: cover`,
with `aspect-ratio` changing per breakpoint — no separate image files per
breakpoint. Frame classes live in `StoryPageView` and `StoryCoverView`.

- Mobile: `aspect-ratio: 4/5`, full-bleed block above the text (`max-sm:` only —
  does not apply at tablet/desktop)
- Tablet + desktop **story pages** (`sm:` / 640px+): `aspect-ratio: 7/3`
  banner strip with `object-cover` (~24% vertical crop on ~16:9 landscape assets)
- Tablet + desktop **cover** (`sm:` / 640px+): fixed-height box
  `h: min(50vh, 480px)` with `object-contain` — full portrait artwork,
  letterboxed on the sides; no crop

## Layout per breakpoint

### Mobile (base)
- Full-screen single column, edge-to-edge
- Image container per "Image container rule" above, full-bleed width
- Text below image, comfortable reading width, generous padding
- Reading progression: split bottom bar pinned to the bottom of the
  viewport — ghost ← (~25%) when history exists + primary **Next Page**
  (~75% / flex-1); story text scrolls above if needed. Decision pages: no
  footer Previous; ← chevron floats top-left over the illustration
- Mystery-word modal: full-screen takeover (not a floating card)
- Touch targets: ≥56px tall for primary CTAs; secondary back ≥44px
  (per storybook-interaction-design)

### Tablet (640–1023px)
- Same stacked book-card layout as desktop: centered card, max-width
  ~600–700px (`max-w-175`), banner image on top, text below
- Modal: centered card, no longer full-screen, ~70–80% width, rounded corners
- Reading: outline **Previous Page** + auto-width **Next Page** in the card
  bottom row. Decision: **← Back** floats top-left over the illustration
  (text card stays free for story + choices)

### Desktop (1024px+)
- Same stacked layout as tablet, wider book card (~800–900px / `max-w-225`),
  centered on a distinct page background — not full-bleed text on a wide viewport
- Image container per "Image container rule" above (7/3 page banner or contained cover)
- Modal: centered card, fixed max-width (~480px), page dims/blurs behind it
- Reading / decision Previous placement same as tablet (bottom-row outline
  Previous; decision **← Back** floating on the illustration)
- Hover states become relevant (button hover, word-hint hover) — mobile/tablet
  don't need hover, only tap feedback

## Non-negotiables across all breakpoints
- Touch targets never shrink below 44px even on desktop (mouse-friendly too)
- Text line-length stays readable (45–75 characters per line) at every size —
  never let text stretch full-width on desktop
- No horizontal scrolling at any breakpoint
