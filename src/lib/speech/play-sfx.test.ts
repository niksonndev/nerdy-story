import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type SfxModule = typeof import("@/lib/speech/play-sfx");

let instances: FakeAudio[];
let mod: SfxModule;

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
  mod = await import("@/lib/speech/play-sfx");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playCorrectSfx", () => {
  it("sets the src and plays the correct chime", () => {
    mod.playCorrectSfx();

    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.src).toBe("/audio/sfx/correct.wav");
    expect(el.play).toHaveBeenCalledTimes(1);
  });

  it("restarts playback when called again", () => {
    mod.playCorrectSfx();
    mod.playCorrectSfx();

    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.pause).toHaveBeenCalled();
    expect(el.currentTime).toBe(0);
    expect(el.play).toHaveBeenCalledTimes(2);
  });
});

describe("playStoryCompleteSfx", () => {
  it("sets the src and plays the story-complete fanfare", () => {
    mod.playStoryCompleteSfx();

    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.src).toBe("/audio/sfx/story-complete.wav");
    expect(el.play).toHaveBeenCalledTimes(1);
  });

  it("shares the same audio element as the correct chime", () => {
    mod.playCorrectSfx();
    mod.playStoryCompleteSfx();

    expect(instances).toHaveLength(1);
    const el = instances[0]!;
    expect(el.src).toBe("/audio/sfx/story-complete.wav");
    expect(el.pause).toHaveBeenCalled();
    expect(el.play).toHaveBeenCalledTimes(2);
  });
});
