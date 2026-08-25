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

## Image container rule (applies to story page)
One image asset per page. The container crops it via `object-fit: cover`,
with `aspect-ratio` changing per breakpoint — no separate image files per
breakpoint.

- Mobile: `aspect-ratio: 4/5`, full-bleed block above the text
- Tablet: `aspect-ratio: 1/1`, left column beside the text
- Desktop: `aspect-ratio: 3/1`, banner strip above the text, inside the book card

## Layout per breakpoint

### Mobile (base)
- Full-screen single column, edge-to-edge
- Image container per "Image container rule" above, full-bleed width
- Text below image, comfortable reading width, generous padding
- "Next Page" button: full-width or near-full-width, fixed near bottom
- Mystery-word modal: full-screen takeover (not a floating card)
- Touch targets: ≥56px tall (per storybook-interaction-design)

### Tablet (640–1023px)
- Story card: centered, max-width ~600–700px, background visible around edges
- Two-column layout: image container (per rule above) as left column,
  text as right column
- Modal: centered card, no longer full-screen, ~70–80% width, rounded corners
- Button: auto-width, centered or bottom-right of card

### Desktop (1024px+)
- Story presented as a fixed-width "book" card (~800–900px), centered on
  a distinct page background — not full-bleed text on a wide viewport
- Image container (per rule above) as a banner strip at the top of the card
- Modal: centered card, fixed max-width (~480px), page dims/blurs behind it
- Hover states become relevant (button hover, word-hint hover) — mobile/tablet
  don't need hover, only tap feedback

## Non-negotiables across all breakpoints
- Touch targets never shrink below 44px even on desktop (mouse-friendly too)
- Text line-length stays readable (45–75 characters per line) at every size —
  never let text stretch full-width on desktop
- No horizontal scrolling at any breakpoint
