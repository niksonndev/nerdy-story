import type { GradeEvalCase } from "../types"

/**
 * Correct explanations the grader must accept. Two per word per category so a
 * grader that passes one phrasing but fails a sibling is caught. Rephrase
 * wording is deliberately different from each word's acceptKeywords.
 */
export const vocabularyAcceptCases: GradeEvalCase[] = [
  // accept-simple — short, plain kid phrasing
  {
    id: "vocab-canopy-simple-1",
    category: "accept-simple",
    wordId: "canopy",
    childAnswer: "the top of the trees",
    expectedCorrect: true,
  },
  {
    id: "vocab-canopy-simple-2",
    category: "accept-simple",
    wordId: "canopy",
    childAnswer: "the treetops way up high",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-simple-1",
    category: "accept-simple",
    wordId: "cautious",
    childAnswer: "being careful",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-simple-2",
    category: "accept-simple",
    wordId: "cautious",
    childAnswer: "careful so you dont get hurt",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-simple-1",
    category: "accept-simple",
    wordId: "camouflage",
    childAnswer: "blending in to hide",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-simple-2",
    category: "accept-simple",
    wordId: "camouflage",
    childAnswer: "hiding by matching the colors around you",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-simple-1",
    category: "accept-simple",
    wordId: "nocturnal",
    childAnswer: "awake at night",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-simple-2",
    category: "accept-simple",
    wordId: "nocturnal",
    childAnswer: "an animal that comes out at night",
    expectedCorrect: true,
  },

  // accept-synonym — correct meaning using different words
  {
    id: "vocab-canopy-synonym-1",
    category: "accept-synonym",
    wordId: "canopy",
    childAnswer: "the leafy ceiling of the jungle",
    expectedCorrect: true,
  },
  {
    id: "vocab-canopy-synonym-2",
    category: "accept-synonym",
    wordId: "canopy",
    childAnswer: "the green roof the tall trees make",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-synonym-1",
    category: "accept-synonym",
    wordId: "cautious",
    childAnswer: "being wary and playing it safe",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-synonym-2",
    category: "accept-synonym",
    wordId: "cautious",
    childAnswer: "staying alert so nothing goes wrong",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-synonym-1",
    category: "accept-synonym",
    wordId: "camouflage",
    childAnswer: "a natural disguise that helps an animal vanish",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-synonym-2",
    category: "accept-synonym",
    wordId: "camouflage",
    childAnswer: "colors that let a creature melt into the background",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-synonym-1",
    category: "accept-synonym",
    wordId: "nocturnal",
    childAnswer: "a creature of the night that moves after dark",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-synonym-2",
    category: "accept-synonym",
    wordId: "nocturnal",
    childAnswer: "active once the sun goes down and asleep by day",
    expectedCorrect: true,
  },

  // accept-imperfect-grammar — right idea, messy spelling/grammar
  {
    id: "vocab-canopy-grammar-1",
    category: "accept-imperfect-grammar",
    wordId: "canopy",
    childAnswer: "it the top part of the tree were the leafs is",
    expectedCorrect: true,
  },
  {
    id: "vocab-canopy-grammar-2",
    category: "accept-imperfect-grammar",
    wordId: "canopy",
    childAnswer: "the tree tops up high wear all the branchs are",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-grammar-1",
    category: "accept-imperfect-grammar",
    wordId: "cautious",
    childAnswer: "when you is carful and dont rushin into stuff",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-grammar-2",
    category: "accept-imperfect-grammar",
    wordId: "cautious",
    childAnswer: "u go slow n watch out so u dont get hurted",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-grammar-1",
    category: "accept-imperfect-grammar",
    wordId: "camouflage",
    childAnswer: "when a animal hide by lookin like the stuff around it",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-grammar-2",
    category: "accept-imperfect-grammar",
    wordId: "camouflage",
    childAnswer: "they blends in so u cant barely see them",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-grammar-1",
    category: "accept-imperfect-grammar",
    wordId: "nocturnal",
    childAnswer: "a animal that stays up all nite and sleep in the day",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-grammar-2",
    category: "accept-imperfect-grammar",
    wordId: "nocturnal",
    childAnswer: "it be movin around at nite time n restin when its day",
    expectedCorrect: true,
  },

  // accept-partial — incomplete but the core idea is right
  {
    id: "vocab-canopy-partial-1",
    category: "accept-partial",
    wordId: "canopy",
    childAnswer: "up high where all the leaves are",
    expectedCorrect: true,
  },
  {
    id: "vocab-canopy-partial-2",
    category: "accept-partial",
    wordId: "canopy",
    childAnswer: "the very top of the forest",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-partial-1",
    category: "accept-partial",
    wordId: "cautious",
    childAnswer: "going slow so nothing bad happens",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-partial-2",
    category: "accept-partial",
    wordId: "cautious",
    childAnswer: "watching out before you do something",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-partial-1",
    category: "accept-partial",
    wordId: "camouflage",
    childAnswer: "when animals match the leaves",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-partial-2",
    category: "accept-partial",
    wordId: "camouflage",
    childAnswer: "colors that help them not be seen",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-partial-1",
    category: "accept-partial",
    wordId: "nocturnal",
    childAnswer: "they sleep during the daytime",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-partial-2",
    category: "accept-partial",
    wordId: "nocturnal",
    childAnswer: "does its stuff when its dark out",
    expectedCorrect: true,
  },

  // accept-rephrase — correct, phrased unlike the acceptKeywords
  {
    id: "vocab-canopy-rephrase-1",
    category: "accept-rephrase",
    wordId: "canopy",
    childAnswer:
      "the layer all the tall tree branches make at the very top of the forest",
    expectedCorrect: true,
  },
  {
    id: "vocab-canopy-rephrase-2",
    category: "accept-rephrase",
    wordId: "canopy",
    childAnswer: "the shady cover the biggest trees spread over the jungle",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-rephrase-1",
    category: "accept-rephrase",
    wordId: "cautious",
    childAnswer: "acting extra alert so you dont run into trouble",
    expectedCorrect: true,
  },
  {
    id: "vocab-cautious-rephrase-2",
    category: "accept-rephrase",
    wordId: "cautious",
    childAnswer: "taking your time and thinking before you make a move",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-rephrase-1",
    category: "accept-rephrase",
    wordId: "camouflage",
    childAnswer: "when an animals pattern makes it almost invisible in its home",
    expectedCorrect: true,
  },
  {
    id: "vocab-camouflage-rephrase-2",
    category: "accept-rephrase",
    wordId: "camouflage",
    childAnswer: "coloring that lets a creature disappear against the trees",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-rephrase-1",
    category: "accept-rephrase",
    wordId: "nocturnal",
    childAnswer: "an animal living on a schedule where dark is its daytime",
    expectedCorrect: true,
  },
  {
    id: "vocab-nocturnal-rephrase-2",
    category: "accept-rephrase",
    wordId: "nocturnal",
    childAnswer: "a creature that does everything after the sun disappears",
    expectedCorrect: true,
  },
]
