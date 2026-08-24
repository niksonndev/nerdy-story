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

export type StoryPage = {
  id: string;
  title: string;
  segments: StorySegment[];
};

export const MAX_ATTEMPTS = 3;

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
};

export const storyPages: StoryPage[] = [
  {
    id: "page-1",
    title: "Pip and the Rainy Woods",
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
    segments: [
      {
        type: "text",
        content:
          "Up ahead, Pip spotted an old oak tree with a round hollow near its roots. She scurried inside, shook the rain from her fur, and curled up warm and dry. Outside the storm rumbled, but Pip just smiled and listened to the rain.",
      },
    ],
  },
];
