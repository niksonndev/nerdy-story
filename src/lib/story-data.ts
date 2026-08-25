export type MysteryWord = {
  id: string;
  word: string;
  targetDefinition: string;
  hints: string[];
  meaningReveal: string;
  acceptKeywords: string[];
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
};

export const MAX_ATTEMPTS = 3;

export const STORY_START_ID = "page-1";

export const mysteryWords: Record<string, MysteryWord> = {
  shelter: {
    id: "shelter",
    word: "shelter",
    targetDefinition:
      "A shelter is a safe, covered place that keeps you protected from rain, wind, cold, or danger.",
    hints: [
      "Think about where you would go to stay dry when it starts to rain.",
      "It is a place with a roof or cover that keeps you safe and protected.",
    ],
    meaningReveal:
      "A shelter is a safe, covered spot that keeps you protected from rain, wind, or cold — like a cozy cave, a little hut, or under a big leaf.",
    acceptKeywords: [
      "safe",
      "protect",
      "cover",
      "roof",
      "hide",
      "dry",
      "shield",
      "out of the rain",
      "warm",
    ],
  },
  snug: {
    id: "snug",
    word: "snug",
    targetDefinition:
      "Snug means warm, cozy, and comfortably tucked in — like feeling safe and soft in a little nest.",
    hints: [
      "Think about how it feels to curl up under a soft blanket on a rainy day.",
      "It means warm and cozy, like you fit just right in a safe little spot.",
    ],
    meaningReveal:
      "Snug means warm, cozy, and comfortably tucked in — like curling up in a soft blanket or a little nest.",
    acceptKeywords: [
      "warm",
      "cozy",
      "comfortable",
      "tucked",
      "soft",
      "safe",
      "nest",
      "blanket",
      "comfy",
    ],
  },
  lullaby: {
    id: "lullaby",
    word: "lullaby",
    targetDefinition:
      "A lullaby is a soft, gentle song that helps someone feel calm and fall asleep.",
    hints: [
      "Think about a quiet song someone might hum to help a baby sleep.",
      "It is a soft, gentle song that makes you feel sleepy and calm.",
    ],
    meaningReveal:
      "A lullaby is a soft, gentle song that helps someone feel calm and drift off to sleep.",
    acceptKeywords: [
      "song",
      "sing",
      "soft",
      "gentle",
      "sleep",
      "sleepy",
      "calm",
      "quiet",
      "hum",
      "bedtime",
    ],
  },
  shimmered: {
    id: "shimmered",
    word: "shimmered",
    targetDefinition:
      "Shimmered means sparkled or shone with soft, moving light — like something twinkling gently.",
    hints: [
      "Think about how a puddle looks when sunlight dances on top of it.",
      "It means sparkled or shone with a soft, twinkly light.",
    ],
    meaningReveal:
      "Shimmered means sparkled or shone with soft, moving light — like a puddle twinkling in the sun.",
    acceptKeywords: [
      "sparkle",
      "sparkled",
      "shine",
      "shone",
      "twinkle",
      "twinkled",
      "glow",
      "glowed",
      "light",
      "glitter",
    ],
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
          "Pip the little raccoon was walking home through the woods when fat raindrops began to fall. Plip! Plop! The sky went gray, and the path turned to mud under her paws. ",
      },
      {
        type: "text",
        content:
          "Pip pulled her tiny hat down tight. \u201cI need to find a ",
      },
      { type: "mystery", wordId: "shelter", content: "shelter" },
      {
        type: "text",
        content:
          ",\u201d she said, \u201csomewhere safe and dry until the storm blows past.\u201d She looked around the dripping trees, wondering where a soggy raccoon could hide.",
      },
    ],
  },
  {
    id: "page-2",
    title: "A Cozy Hollow",
    image: "/images/story/pip-and-the-rainy-woods/page-2.jpg",
    nextPageId: "page-3",
    segments: [
      {
        type: "text",
        content:
          "Up ahead, Pip spotted an old oak tree with a round hollow near its roots. She scurried inside, shook the rain from her fur, and curled up warm and dry. Outside the storm rumbled, but Pip just smiled and listened to the rain.",
      },
    ],
  },
  {
    id: "page-3",
    title: "Safe and Dry",
    image: "/images/story/pip-and-the-rainy-woods/page-3.jpg",
    choice: {
      prompt: "What does Pip do?",
      options: [
        {
          label: "Stay curled up, warm and cozy",
          nextPageId: "page-4a",
        },
        {
          label: "Peek outside to see the rain",
          nextPageId: "page-4b",
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
    id: "page-4a",
    title: "A Cozy Nap",
    image: "/images/story/pip-and-the-rainy-woods/page-4a.jpg",
    segments: [
      {
        type: "text",
        content:
          "Pip yawned and curled up tighter, tail wrapped around her like a blanket. The rain outside sounded like a soft ",
      },
      { type: "mystery", wordId: "lullaby", content: "lullaby" },
      {
        type: "text",
        content:
          ", and soon her eyes grew heavy. When she woke, warm sunlight was pouring through the hollow. The storm was gone. Pip stretched, smiled, and padded home along a path sparkling with puddles, dry and happy the whole way.",
      },
    ],
  },
  {
    id: "page-4b",
    title: "A Sparkling Surprise",
    image: "/images/story/pip-and-the-rainy-woods/page-4b.jpg",
    segments: [
      {
        type: "text",
        content:
          "Pip crept to the edge of the hollow and peeked out. The rain had softened to a gentle drizzle, and the whole forest seemed to glow. Puddles ",
      },
      { type: "mystery", wordId: "shimmered", content: "shimmered" },
      {
        type: "text",
        content:
          " like little mirrors, and high above the trees, a faint rainbow curled through the clouds. Pip gasped. She hadn't expected the rain to leave something so beautiful behind. She stepped out, ready to explore.",
      },
    ],
  },
];

export const storyPagesById: Record<string, StoryPage> = Object.fromEntries(
  storyPages.map((page) => [page.id, page]),
);
