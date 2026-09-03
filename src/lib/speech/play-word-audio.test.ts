import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AudioModule = typeof import("@/lib/speech/play-word-audio");

let instances: FakeAudio[];
let mod: AudioModule;

class FakeAudio {
  src = "";
  currentTime = 0;
  pause = vi.fn();
  play = vi.fn(() => Promise.resolve());

  constructor() {
    instances.push(this);
  }
}

beforeEach(async () => {
  vi.resetModules();
  instances = [];
  vi.stubGlobal("Audio", FakeAudio);
  mod = await import("@/lib/speech/play-word-audio");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mysteryWordAudioSrc", () => {
  it("maps a word id to its clip path", () => {
    expect(mod.mysteryWordAudioSrc("canopy")).toBe(
      "/audio/mystery-words/canopy.mp3",
    );
  });
});

describe("canPlayMysteryWord", () => {
  it("is true for known words and false otherwise", () => {
    expect(mod.canPlayMysteryWord("canopy")).toBe(true);
    expect(mod.canPlayMysteryWord("banana")).toBe(false);
  });
});

describe("playWordAudio", () => {
  it("sets the src and plays the clip", () => {
    mod.playWordAudio("canopy");

    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.src).toBe("/audio/mystery-words/canopy.mp3");
    expect(el.play).toHaveBeenCalledTimes(1);
  });

  it("cancels the current clip before playing again (no stacking)", () => {
    mod.playWordAudio("canopy");
    mod.playWordAudio("cautious");

    // Reuses the same singleton element.
    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.pause).toHaveBeenCalled();
    expect(el.currentTime).toBe(0);
    expect(el.src).toBe("/audio/mystery-words/cautious.mp3");
    expect(el.play).toHaveBeenCalledTimes(2);
  });

  it("ignores unknown words", () => {
    mod.playWordAudio("banana");
    expect(instances).toHaveLength(0);
  });
});

describe("stopWordAudio", () => {
  it("pauses and rewinds playback", () => {
    mod.playWordAudio("canopy");
    const el = instances[0]!;
    el.currentTime = 1.2;

    mod.stopWordAudio();

    expect(el.pause).toHaveBeenCalled();
    expect(el.currentTime).toBe(0);
  });
});
