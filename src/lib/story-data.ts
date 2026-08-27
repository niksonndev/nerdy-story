export type MysteryWord = {
  id: string;
  word: string;
  targetDefinition: string;
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
  shelter: {
    id: "shelter",
    word: "shelter",
    targetDefinition:
      "A shelter is a safe, covered place that keeps you protected from rain, wind, cold, or danger.",
    acceptKeywords: [
      "safe place",
      "covered place",
      "stay dry",
      "protected",
      "roof",
      "hide",
    ],
    hints: [
      "Think about where you would go to stay dry when it starts to rain.",
      "It is a place with a roof or cover that keeps you safe and protected.",
    ],
    meaningReveal:
      "A shelter is a safe, covered spot that keeps you protected from rain, wind, or cold — like a cozy cave, a little hut, or under a big leaf.",
  },
  snug: {
    id: "snug",
    word: "snug",
    targetDefinition:
      "Snug means warm, cozy, and comfortably tucked in — like feeling safe and soft in a little nest.",
    acceptKeywords: [
      "cozy",
      "warm",
      "tucked",
      "comfortable",
      "comfy",
      "curl up",
    ],
    hints: [
      "Think about how it feels to curl up under a soft blanket on a rainy day.",
      "It means warm and cozy, like you fit just right in a safe little spot.",
    ],
    meaningReveal:
      "Snug means warm, cozy, and comfortably tucked in — like curling up in a soft blanket or a little nest.",
  },
  lullaby: {
    id: "lullaby",
    word: "lullaby",
    targetDefinition:
      "A lullaby is a soft, gentle song that helps someone feel calm and fall asleep.",
    acceptKeywords: [
      "sleep song",
      "gentle song",
      "soft song",
      "bedtime song",
      "asleep",
      "sleepy",
    ],
    hints: [
      "Think about a quiet song someone might hum to help a baby sleep.",
      "It is a soft, gentle song that makes you feel sleepy and calm.",
    ],
    meaningReveal:
      "A lullaby is a soft, gentle song that helps someone feel calm and drift off to sleep.",
  },
  shimmered: {
    id: "shimmered",
    word: "shimmered",
    targetDefinition:
      "Shimmered means sparkled or shone with soft, moving light — like something twinkling gently.",
    acceptKeywords: [
      "sparkled",
      "sparkle",
      "twinkled",
      "twinkle",
      "shone",
      "glittered",
    ],
    hints: [
      "Think about how a puddle looks when sunlight dances on top of it.",
      "It means sparkled or shone with a soft, twinkly light.",
    ],
    meaningReveal:
      "Shimmered means sparkled or shone with soft, moving light — like a puddle twinkling in the sun.",
  },
};

export const comprehensionChallenges: Record<string, ComprehensionChallenge> = {
  "find-shelter": {
    id: "find-shelter",
    question: "Why does Pip need to find a shelter?",
    passage:
      "Pip the little raccoon was walking home through the woods when fat raindrops began to fall. Plip! Plop! The sky went gray, and the path turned to mud under her paws. Pip pulled her tiny hat down tight. \"I need to find a shelter,\" she said, \"somewhere safe and dry until the storm blows past.\"",
    expectedUnderstanding:
      "Pip needs a shelter because it is raining hard and she wants a safe, dry place to wait out the storm.",
    acceptKeywords: [
      "raining",
      "rain",
      "stay dry",
      "storm",
      "safe place",
      "safe and dry",
    ],
    hints: [
      "Think about what the sky and the rain are doing to Pip.",
      "Pip wants somewhere safe and dry until the storm goes away.",
    ],
    answerReveal:
      "Pip needs a shelter because the rain is falling hard, and she wants a safe, dry place to wait until the storm blows past.",
  },
  "cozy-nap": {
    id: "cozy-nap",
    question: "Why does Pip stay curled up in the hollow?",
    passage:
      "Pip yawned and curled up tighter, tail wrapped around her like a blanket. The rain outside kept singing its quiet song. Her eyes grew heavy. Soon she was drifting toward a soft little sleep in the hollow.",
    expectedUnderstanding:
      "Pip stays curled up because she is cozy, sleepy, and comfortable resting safely in the hollow while the rain sings quietly outside.",
    acceptKeywords: [
      "cozy",
      "sleepy",
      "sleep",
      "rest",
      "hollow",
      "comfortable",
      "comfy",
    ],
    hints: [
      "Think about how Pip feels after she wraps her tail around herself.",
      "Pip is cozy and sleepy, so she stays to rest in the hollow.",
    ],
    answerReveal:
      "Pip stays curled up because she feels cozy and sleepy in the safe hollow, and the quiet rain helps her rest.",
  },
  "rainy-surprise": {
    id: "rainy-surprise",
    question: "What does Pip notice when she peeks outside?",
    passage:
      "Pip crept to the edge of the hollow and peeked out. The rain had softened to a gentle drizzle, and the whole forest seemed to glow. Something beautiful was waiting just beyond the trees.",
    expectedUnderstanding:
      "Pip notices the rain has softened to a gentle drizzle and the forest seems to glow, with something beautiful waiting beyond the trees.",
    acceptKeywords: [
      "drizzle",
      "glow",
      "glowing",
      "gentler",
      "rain softened",
      "beautiful",
      "soft rain",
    ],
    hints: [
      "Think about how the rain has changed since the storm.",
      "The rain is gentler now, and the forest looks like it is glowing.",
    ],
    answerReveal:
      "Pip notices the rain has softened to a gentle drizzle, and the whole forest seems to glow — with something beautiful waiting just beyond the trees.",
  },
};

export const storyPages: StoryPage[] = [
  {
    id: "page-1",
    title: "Pip and the Rainy Woods",
    image: "/images/story/pip-and-the-rainy-woods/page-1.jpg",
    nextPageId: "page-2",
    segments: [
      {
        type: "text",
        content:
          "Pip the little raccoon was walking home through the woods when fat raindrops began to fall. Plip! Plop! The sky went gray, and the path turned to mud under her paws. Pip pulled her tiny hat down tight and hurried along the dripping trail.",
      },
    ],
  },
  {
    id: "page-2",
    title: "Looking for Cover",
    image: "/images/story/pip-and-the-rainy-woods/page-2.jpg",
    nextPageId: "page-3",
    segments: [
      {
        type: "text",
        content:
          "\u201cI need to find a ",
      },
      { type: "mystery", wordId: "shelter", content: "shelter" },
      {
        type: "text",
        content:
          ",\u201d Pip said, \u201csomewhere safe and dry until the storm blows past.\u201d She looked around the dripping trees, wondering where a soggy raccoon could hide.",
      },
    ],
  },
  {
    id: "page-3",
    title: "A Hollow in the Oak",
    image: "/images/story/pip-and-the-rainy-woods/page-3.jpg",
    nextPageId: "page-4",
    comprehensionId: "find-shelter",
    segments: [
      {
        type: "text",
        content:
          "Up ahead, Pip spotted an old oak tree with a round hollow near its roots. She scurried inside, shook the rain from her fur, and curled up warm and dry. Outside the storm rumbled, but Pip just smiled — she had found what she needed.",
      },
    ],
  },
  {
    id: "page-4",
    title: "Listening to the Rain",
    nextPageId: "page-5",
    segments: [
      {
        type: "text",
        content:
          "For a little while Pip just listened. Drip… drip… drip… The rain tapped the leaves like tiny drumbeats. The hollow smelled like wet wood and soft moss. Pip breathed slowly and felt the storm growing quieter.",
      },
    ],
  },
  {
    id: "page-5",
    title: "Safe and Dry",
    choice: {
      prompt: "What does Pip do?",
      options: [
        {
          label: "Stay curled up, warm and cozy",
          nextPageId: "page-6a",
        },
        {
          label: "Peek outside to see the rain",
          nextPageId: "page-6b",
        },
      ],
    },
    segments: [
      {
        type: "text",
        content:
          "Inside the hollow, Pip shook the last raindrops from her fur. It was warm and ",
      },
      { type: "mystery", wordId: "snug", content: "snug" },
      {
        type: "text",
        content:
          ", and the storm rumbled softly outside, far away now. Pip peeked toward the little opening in the tree, where she could still see rain falling in silver lines.",
      },
      {
        type: "text",
        content:
          " She could stay curled up here, cozy and still. Or she could take one more peek outside, just to see what the rainy forest looked like now.",
      },
    ],
  },
  {
    id: "page-6a",
    title: "A Cozy Choice",
    nextPageId: "page-7a",
    comprehensionId: "cozy-nap",
    segments: [
      {
        type: "text",
        content:
          "Pip yawned and curled up tighter, tail wrapped around her like a blanket. The rain outside kept singing its quiet song. Her eyes grew heavy. Soon she was drifting toward a soft little sleep in the hollow.",
      },
    ],
  },
  {
    id: "page-6b",
    title: "A Peek Outside",
    nextPageId: "page-7b",
    comprehensionId: "rainy-surprise",
    segments: [
      {
        type: "text",
        content:
          "Pip crept to the edge of the hollow and peeked out. The rain had softened to a gentle drizzle, and the whole forest seemed to glow. Something beautiful was waiting just beyond the trees.",
      },
    ],
  },
  {
    id: "page-7a",
    title: "A Cozy Nap",
    image: "/images/story/pip-and-the-rainy-woods/page-4a.jpg",
    segments: [
      {
        type: "text",
        content:
          "The rain outside sounded like a soft ",
      },
      { type: "mystery", wordId: "lullaby", content: "lullaby" },
      {
        type: "text",
        content:
          ", and soon Pip\u2019s eyes closed all the way. When she woke, warm sunlight was pouring through the hollow. The storm was gone. Pip stretched, smiled, and padded home along a path sparkling with puddles, dry and happy the whole way.",
      },
    ],
  },
  {
    id: "page-7b",
    title: "A Sparkling Surprise",
    image: "/images/story/pip-and-the-rainy-woods/page-4b.jpg",
    segments: [
      {
        type: "text",
        content:
          "Puddles ",
      },
      { type: "mystery", wordId: "shimmered", content: "shimmered" },
      {
        type: "text",
        content:
          " like little mirrors, and high above the trees, a faint rainbow curled through the clouds. Pip gasped. She hadn\u2019t expected the rain to leave something so beautiful behind. She stepped out, ready to explore.",
      },
    ],
  },
];

export const storyPagesById: Record<string, StoryPage> = Object.fromEntries(
  storyPages.map((page) => [page.id, page]),
);
