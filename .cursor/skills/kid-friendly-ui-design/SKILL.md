---
name: kid-friendly-ui-design
description: >-
  Defines how nerdy-story child-facing UI should look and feel: adventure
  storybook for ages 7–9 — colorful, magical, readable, game-like. Use when
  choosing color, type, shape, illustration, visual composition, Tailwind
  tokens, or restyling shadcn for child-facing screens.
---

# Kid-friendly UI design

Looks and feel only. Interaction (Next Page, gating, controls, chrome copy) is [storybook-interaction-design](../storybook-interaction-design/SKILL.md). Motion is [motion-animation](../motion-animation/SKILL.md). Product scope lives in `.cursor/rules/product-mvp.mdc`.

nerdy-story is a playful interactive storybook for children aged 7–9. The UI should feel colorful, magical, friendly and game-like while remaining highly readable. Design for independent use by a child: obvious actions, large controls, minimal cognitive load, encouraging feedback, and strong visual hierarchy. Favor expressive illustrations, rounded shapes, warm backgrounds, playful accent colors and subtle motion. Avoid corporate SaaS aesthetics, dense dashboards, tiny controls, excessive gradients, excessive animation and babyish visual language. The child should feel that they are exploring a story rather than completing a lesson.

Prefer composition over collections of cards. The story screen should feel like a single storybook page, not a dashboard composed of cards. Use containers when they improve readability or interaction, but do not wrap every element in a rounded panel.

**Precedence:** This skill governs product/story *visuals*. It overrides generic landing-page / SaaS habits (hero stats, card grids, pill clusters, dark mode, Inter/Geist, purple-indigo, cream+terracotta serif). Marketing-page rules do not apply inside the storybook.

## Visual direction: adventure storybook

A painted storybook page with a light game HUD — not a classroom, not a toddler toy.

| Role | Use | Token |
| --- | --- | --- |
| Page | Warm butter paper (not #F4F1EA cream-terracotta) | `#FFF4D6` |
| Ink | Deep forest, high contrast on paper | `#243428` |
| Primary action | Coral, one obvious CTA | `#E24A3A` |
| Magic / progress | Teal for words-learned and spark moments | `#0F8A7A` |
| Reward | Gold for learned-word highlights | `#D4920A` |
| Secondary choice | Sky, equal-weight branch options | `#4E8FBF` |

**Color bans:** purple/indigo systems, dark mode, neon, pastel rainbow, grayscale shadcn neutrals as the page.

**Type:** Grandstander for titles/UI labels (friendly, slightly irregular, not infant) + Lexend for story body and form text. Story body ~18–22px, line-height 1.6–1.8. Do not use Geist, Inter, Comic Sans, or preschool display fonts (Luckiest Guy, Cherry Bomb).

**Shape:** Generous rounding on interactive controls and the few containers that earn a panel. Not `rounded-full` pill clusters. Not hairline cards with drop shadows.

**Imagery:** Expressive scene illustration as atmosphere (full-bleed or page-filling), not Lucide icon rows. Icons only as support on controls.

### Restyle starter defaults

The app ships with Geist, zinc/white, and shadcn sizes like `h-8`. Do not ship those for child-facing UI — restyle tokens and add/use a large kid button variant.

## Composition

- Compose the story screen as a single storybook page (illustration + readable text + quiet chrome), not a grid of bordered panels.
- Containers are allowed for the vocab challenge, feedback, and large branch choices — places where a panel clarifies “this is the thing to do.”
- Do not card-wrap story paragraphs, the words-learned count, decorative illustration, or every label.
- If removing a border/background/radius does not hurt readability or the interaction, remove it.

## Hard avoids (visual)

Fail closed if any of these appear:

- Corporate dashboards, card grids / collections of rounded panels
- Tiny controls, dense forms
- Excessive gradients
- Babyish motifs (balloons, ABCs, primary-color blocks, baby animals as the whole brand)
- Lesson-y framing, emoji spam, settings/nav chrome

## Screen visuals

For visual hierarchy per MVP screen, see [screens.md](screens.md).

## Pre-ship checklist

- [ ] Reads as a single storybook page, not a dashboard of cards
- [ ] Adventure palette + Grandstander/Lexend, not Geist/zinc
- [ ] No SaaS, babyish, or purple-gradient defaults
