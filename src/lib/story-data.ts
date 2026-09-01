export type MysteryWord = {
  id: string;
  word: string;
  targetDefinition: string;
  /** Short kid-facing idea for local miss-reason copy. */
  coreIdea: string;
  /** Synonyms / short phrases kids may type; used by local grade fallback. */
  acceptKeywords?: string[];
  hints: string[];
  meaningReveal: string;
};

export type ComprehensionChallenge = {
  id: string;
  /** Kid-facing learning objective / question. */
  question: string;
  /** Explicit excerpt for the grader (not scraped from page layout). */
  passage: string;
  expectedUnderstanding: string;
  /** Short kid-facing idea for local miss-reason copy. */
  coreIdea: string;
  /** Synonyms / short phrases kids may type; used by local grade fallback. */
  acceptKeywords?: string[];
  /** 2 tiers — server local miss + client HTTP-fail path. */
  hints: string[];
  /** Soft-progression reveal after retry limit. */
  answerReveal: string;
};

export type StorySegment =
  | { type: "text"; content: string }
  | { type: "mystery"; wordId: string; content: string };

export type BranchOption = {
  label: string;
  nextPageId: string;
};

export type StoryChoice = {
  prompt: string;
  options: [BranchOption, BranchOption];
};

export type StoryPage = {
  id: string;
  title: string;
  image?: string;
  segments: StorySegment[];
  nextPageId?: string;
  choice?: StoryChoice;
  /** At most one; not paired with mystery words on the same page in this map. */
  comprehensionId?: string;
};

export const MAX_ATTEMPTS = 3;

export const STORY_START_ID = "page-1";

export const mysteryWords: Record<string, MysteryWord> = {
  canopy: {
    id: "canopy",
    word: "canopy",
    targetDefinition:
      "The roof-like layer formed by the tops of tall rainforest trees.",
    coreIdea: "treetops high in the forest",
    acceptKeywords: [
      "treetops",
      "top of the trees",
      "leaves up high",
      "tree ceiling",
    ],
    hints: [
      "Think about the very top of the forest, where the leaves and branches are so thick they block the sun.",
      "It's like a leafy roof way above your head, where lots of animals live.",
    ],
    meaningReveal:
      "The canopy is the leafy 'roof' made by the tallest trees in the rainforest — many animals, like sloths, spend their whole lives up there.",
  },
  cautious: {
    id: "cautious",
    word: "cautious",
    targetDefinition:
      "Being careful to avoid danger or mistakes.",
    coreIdea: "being careful and watching out",
    acceptKeywords: [
      "careful",
      "not rushing",
      "watching out",
      "being safe",
    ],
    hints: [
      "It's how you act when you want to avoid getting hurt or making a mistake — you go slow and pay attention.",
      "If you tiptoe around something because you're not sure it's safe, you're being this word.",
    ],
    meaningReveal:
      "Cautious means being careful and paying close attention before you act, so you don't get into trouble or danger.",
  },
  camouflage: {
    id: "camouflage",
    word: "camouflage",
    targetDefinition:
      "Colors or patterns that help an animal blend in and hide.",
    coreIdea: "blending in and hiding",
    acceptKeywords: [
      "blending in",
      "hiding by matching colors",
      "disguise",
    ],
    hints: [
      "It's why some animals are almost invisible against leaves, bark, or rocks.",
      "Think of coloring that helps an animal 'disappear' into its surroundings.",
    ],
    meaningReveal:
      "Camouflage is a coloring or pattern that helps an animal blend into its surroundings so predators (or curious kids!) have trouble spotting it.",
  },
  nocturnal: {
    id: "nocturnal",
    word: "nocturnal",
    targetDefinition:
      "Active mostly at night and resting during the day.",
    coreIdea: "being active at night",
    acceptKeywords: [
      "awake at night",
      "sleeps in the day",
      "night animal",
    ],
    hints: [
      "Some animals do most of their moving around after the sun goes down — this word describes them.",
      "It's the opposite of being active during the daytime.",
    ],
    meaningReveal:
      "Nocturnal animals are most active at night and rest during the day — many rainforest creatures live on this night schedule.",
  },
};

export const comprehensionChallenges: Record<string, ComprehensionChallenge> = {
  "track-clues": {
    id: "track-clues",
    question: "How did Mia and Grandpa Elias know a sloth had been nearby?",
    passage:
      "Grandpa Elias crouched by a low branch and pointed at some scratched bark and a few strands of greenish fur caught in the wood. 'Sloths move so slowly that algae grows right in their fur,' he said. 'This bark was scraped recently — a sloth passed through here, not long ago.'",
    expectedUnderstanding:
      "The child should connect the scraped bark and greenish fur to evidence that a sloth had recently been in that spot — reasoning from clues, not guessing.",
    coreIdea: "clues on the branch",
    acceptKeywords: [
      "scraped bark",
      "green fur",
      "algae fur",
      "claw marks",
      "fur clue",
    ],
    hints: [
      "Look again at what Grandpa Elias noticed on the branch — two separate clues, not just one.",
      "One clue was on the bark itself, the other was caught inside it.",
    ],
    answerReveal:
      "They noticed scraped bark and greenish fur (with algae growing in it) caught on the branch — both signs that a sloth had recently climbed through.",
  },
  "tracks-choice-outcome": {
    id: "tracks-choice-outcome",
    question: "Why did following the tracks alone turn out to be risky at first?",
    passage:
      "The trail split in two, and the paw prints grew fainter with every step. Mia stayed cautious, moving slowly under the canopy so she wouldn't crash through the underbrush and scare anything away. Twice she nearly followed the wrong trail before spotting a fresh scrape on a tree that pointed her the right way.",
    expectedUnderstanding:
      "The child should recognize that the trail became unclear/faint and Mia almost took a wrong path, showing that going without help required extra care and could easily have led her astray.",
    coreIdea: "why the faint tracks were risky",
    acceptKeywords: [
      "faint tracks",
      "almost lost trail",
      "wrong path",
      "hard to follow",
    ],
    hints: [
      "Think about what happened to the prints the further Mia went.",
      "She almost made a mistake twice — what kind of mistake?",
    ],
    answerReveal:
      "The prints grew faint and the trail split, so Mia nearly went the wrong way twice before a fresh scrape mark set her straight.",
  },
  "guide-choice-outcome": {
    id: "guide-choice-outcome",
    question:
      "What did the ranger station teach Mia and Grandpa Elias about when to look for the sloth?",
    passage:
      "The ranger checked her notes and smiled. 'You won't see much movement from a sloth at midday — they rest then. Come back near dusk, and climb the observation platform. That's when they start moving to feed.' Mia and Grandpa Elias thanked her and decided to wait it out at the platform.",
    expectedUnderstanding:
      "The child should identify that the ranger explained sloths are more active later in the day (near dusk) rather than at midday, and that this timing knowledge is why they waited at the platform.",
    coreIdea: "when sloths are active",
    acceptKeywords: [
      "wait until dusk",
      "sloths active later",
      "rest at midday",
      "come back later",
    ],
    hints: [
      "What time of day did the ranger say sloths start moving?",
      "Think about why Mia and Grandpa Elias decided to wait instead of leaving.",
    ],
    answerReveal:
      "The ranger explained that sloths rest at midday and become active near dusk, so Mia and Grandpa Elias waited at the observation platform until then.",
  },
};

const STORY_IMAGE = "/images/story/mia-and-the-hidden-sloth";

export const STORY_META = {
  id: "mia-and-the-hidden-sloth",
  title: "Mia and the Hidden Sloth",
  coverImage: `${STORY_IMAGE}/cover.jpeg`,
  protagonistName: "Mia",
} as const;

export const storyPages: StoryPage[] = [
  {
    id: "page-1",
    title: "Into the Rainforest",
    image: `${STORY_IMAGE}/page-1.jpeg`,
    nextPageId: "page-2",
    segments: [
      {
        type: "text",
        content:
          "Mia stepped off the boat and into the warm, buzzing air of the rainforest. Her grandfather, Elias — a naturalist guide who had explored this forest for thirty years — adjusted his hat and grinned. \"Ready for your first real jungle expedition?\" he asked. Mia nodded, clutching her notebook. Somewhere out there, hidden in the trees, was the animal she'd been dreaming about for weeks: a wild sloth.",
      },
    ],
  },
  {
    id: "page-2",
    title: "Up Among the Leaves",
    image: `${STORY_IMAGE}/page-2.jpeg`,
    nextPageId: "page-3",
    segments: [
      {
        type: "text",
        content:
          "They followed a narrow path deeper into the trees. Grandpa Elias pointed upward, where the branches wove together so tightly that only thin beams of sunlight reached the ground. \"That's the ",
      },
      { type: "mystery", wordId: "canopy", content: "canopy" },
      {
        type: "text",
        content:
          ",\" he said. \"Most of the rainforest's life happens up there, far above our heads — including the sloths.\" Mia tilted her head back, searching the green ceiling for any sign of movement.",
      },
    ],
  },
  {
    id: "page-3",
    title: "The First Clue",
    image: `${STORY_IMAGE}/page-3.jpeg`,
    nextPageId: "page-4",
    comprehensionId: "track-clues",
    segments: [
      {
        type: "text",
        content:
          "Grandpa Elias crouched by a low branch and pointed at some scratched bark and a few strands of greenish fur caught in the wood. \"Sloths move so slowly that algae grows right in their fur,\" he said. \"This bark was scraped recently — a sloth passed through here, not long ago.\" Mia's heart raced. They were close.",
      },
    ],
  },
  {
    id: "page-4",
    title: "Two Paths",
    image: `${STORY_IMAGE}/page-4.jpeg`,
    nextPageId: "page-5",
    segments: [
      {
        type: "text",
        content:
          "The path ahead split in two directions. One trail followed a faint line of scratch marks and prints leading deeper into the trees. The other looped back toward a small wooden building with a faded sign: RANGER STATION. Mia glanced at the canopy overhead — sloths could be anywhere up there — then back at the two trails on the ground. Grandpa Elias looked at Mia. \"Which way do you think we should go?\"",
      },
    ],
  },
  {
    id: "page-5",
    title: "Mia's Decision",
    image: `${STORY_IMAGE}/page-5.jpeg`,
    choice: {
      prompt: "What should Mia and Grandpa Elias do?",
      options: [
        {
          label: "Follow the tracks themselves",
          nextPageId: "page-6a",
        },
        {
          label: "Ask the ranger station for help",
          nextPageId: "page-6b",
        },
      ],
    },
    segments: [
      {
        type: "text",
        content:
          "Mia thought hard. Rushing after the tracks alone felt exciting, but it also felt risky — the forest was easy to get lost in. Being ",
      },
      { type: "mystery", wordId: "cautious", content: "cautious" },
      {
        type: "text",
        content:
          " might mean asking for help instead of guessing. \"We should think this through carefully before we choose,\" Grandpa Elias said gently, waiting for her answer.",
      },
    ],
  },
  {
    id: "page-6a",
    title: "Following the Trail",
    image: `${STORY_IMAGE}/page-6a.jpeg`,
    nextPageId: "page-7a",
    comprehensionId: "tracks-choice-outcome",
    segments: [
      {
        type: "text",
        content:
          "The trail split in two, and the paw prints grew fainter with every step. Mia stayed cautious, moving slowly under the canopy so she wouldn't crash through the underbrush and scare anything away. Twice she nearly followed the wrong trail before spotting a fresh scrape on a tree that pointed her the right way.",
      },
    ],
  },
  {
    id: "page-6b",
    title: "At the Ranger Station",
    image: `${STORY_IMAGE}/page-6b.jpeg`,
    nextPageId: "page-7b",
    comprehensionId: "guide-choice-outcome",
    segments: [
      {
        type: "text",
        content:
          "The ranger checked her notes and smiled. \"You won't see much movement from a sloth at midday — they rest then. Come back near dusk, and climb the observation platform. That's when they start moving to feed.\" Mia and Grandpa Elias thanked her and decided to wait it out at the platform. They stayed cautious and quiet, and Grandpa Elias pointed at the canopy above. \"That's where she'll appear,\" he whispered.",
      },
    ],
  },
  {
    id: "page-7a",
    title: "Spotted!",
    image: `${STORY_IMAGE}/page-7a.jpeg`,
    segments: [
      {
        type: "text",
        content:
          "Mia froze. High in a fork of branches, a shape she'd almost missed shifted slightly — gray-green fur, patterned just like the mossy bark around it. \"There!\" she whispered. Grandpa Elias smiled. \"That's ",
      },
      { type: "mystery", wordId: "camouflage", content: "camouflage" },
      {
        type: "text",
        content:
          " doing its job. You have sharp eyes, Mia.\" They watched, breathless, as the sloth slowly turned its head toward them.",
      },
    ],
  },
  {
    id: "page-7b",
    title: "Waiting for Dusk",
    image: `${STORY_IMAGE}/page-7b.jpeg`,
    segments: [
      {
        type: "text",
        content:
          "As the light turned orange, Mia heard a rustle above. A sloth, unhurried and calm, began climbing toward a cluster of leaves — right on schedule. \"Most sloths are ",
      },
      { type: "mystery", wordId: "nocturnal", content: "nocturnal" },
      {
        type: "text",
        content:
          ", or close to it,\" Grandpa Elias whispered. \"They come alive just as the day winds down.\" Mia grinned, watching the slow-moving shape at last.",
      },
    ],
  },
];

export const storyPagesById: Record<string, StoryPage> = Object.fromEntries(
  storyPages.map((page) => [page.id, page]),
);
