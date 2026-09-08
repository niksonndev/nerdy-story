import { contentTokens, overlapCount } from "@/lib/grade/local-helpers";

/** Same bar as shame language: two distinctive tokens from the answer is a leak. */
export const HINT_LEAK_OVERLAP = 2;

/** Function words and don't-splits that are not the answer. */
const NON_DISTINCTIVE = new Set([
  "about",
  "could",
  "day",
  "did",
  "does",
  "don",
  "elias",
  "forest",
  "get",
  "got",
  "grandpa",
  "her",
  "him",
  "his",
  "how",
  "make",
  "made",
  "mia",
  "print",
  "prints",
  "rainforest",
  "she",
  "should",
  "tall",
  "them",
  "then",
  "they",
  "their",
  "tree",
  "trees",
  "way",
  "why",
  "would",
]);

const CAMOUFLAGE_BLEND = /\bblend(?:ing|s)?\b/i;
const CAMOUFLAGE_COLOR = /\bcolou?rs?\b|\bcoloring\b/i;
const CAMOUFLAGE_PATTERN = /\bpatterns?\b/i;
const NOCTURNAL_DAY = /\bdays?\b/i;
const NOCTURNAL_NIGHT = /\bnight/i;
const SLOTH_TIMING_REST = /\brest(?:s|ing|ed)?\b/i;
const SLOTH_TIMING_ACTIVE = /\bmov(?:e|es|ing|ed)\b|\bactive\b/i;
const TRACKS_TRAIL = /\btrails?\b/i;
const TRACKS_SPLIT = /\bsplit(?:s|ting|ted)?\b/i;

function distinctiveTokens(text: string): Set<string> {
  return new Set(
    [...contentTokens(text)].filter(
      (token) => token.length > 2 && !NON_DISTINCTIVE.has(token),
    ),
  );
}

export type HintLeakOptions = {
  camouflage?: boolean;
  nocturnal?: boolean;
  /** Ranger timing contrast: rest and moving/active together hands over the answer. */
  slothTiming?: boolean;
  /** Tracks-risk: trail and split together names the plot beat. */
  tracksSplit?: boolean;
  /** Child answer (and comprehension question): nodding is not leaking. */
  allowedText?: string;
};

/**
 * Whether a kid-facing hint hands over the answer. Null if the hint is safe.
 * Camouflage must not name blend / colors+patterns (the means).
 * Tokens the child (or the question) already used do not count as a leak.
 */
export function hintLeakMessage(
  hint: string,
  targets: string[],
  options?: HintLeakOptions,
): string | null {
  if (options?.camouflage) {
    if (CAMOUFLAGE_BLEND.test(hint)) {
      return `Hint names camouflage's means (blend): "${hint}"`;
    }
    if (CAMOUFLAGE_COLOR.test(hint) && CAMOUFLAGE_PATTERN.test(hint)) {
      return `Hint names camouflage's means (colors/patterns): "${hint}"`;
    }
  }
  if (
    options?.nocturnal &&
    NOCTURNAL_DAY.test(hint) &&
    NOCTURNAL_NIGHT.test(hint)
  ) {
    return `Hint names nocturnal's night/day contrast: "${hint}"`;
  }
  if (
    options?.slothTiming &&
    SLOTH_TIMING_REST.test(hint) &&
    SLOTH_TIMING_ACTIVE.test(hint)
  ) {
    return `Hint names the rest/moving timing contrast: "${hint}"`;
  }
  if (
    options?.tracksSplit &&
    TRACKS_TRAIL.test(hint) &&
    TRACKS_SPLIT.test(hint)
  ) {
    return `Hint names the trail-split clue: "${hint}"`;
  }

  const allowed = options?.allowedText
    ? distinctiveTokens(options.allowedText)
    : new Set<string>();
  const hintTokens = new Set(
    [...distinctiveTokens(hint)].filter((token) => !allowed.has(token)),
  );
  for (const target of targets) {
    if (!target) continue;
    const overlap = overlapCount(hintTokens, distinctiveTokens(target));
    if (overlap >= HINT_LEAK_OVERLAP) {
      return `Hint leaks the answer (${overlap} overlapping tokens): "${hint}"`;
    }
  }
  return null;
}
