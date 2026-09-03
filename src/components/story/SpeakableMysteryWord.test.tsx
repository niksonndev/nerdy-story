import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SpeakableMysteryWord } from "@/components/story/SpeakableMysteryWord";
import { canPlayMysteryWord, playWordAudio } from "@/lib/speech/play-word-audio";

vi.mock("@/lib/speech/play-word-audio", () => ({
  canPlayMysteryWord: vi.fn(() => true),
  playWordAudio: vi.fn(),
}));

const mockedCanPlay = vi.mocked(canPlayMysteryWord);

beforeEach(() => {
  vi.clearAllMocks();
  mockedCanPlay.mockReturnValue(true);
});

describe("SpeakableMysteryWord", () => {
  it("plays the clip on click when a recording exists", async () => {
    const user = userEvent.setup();
    render(<SpeakableMysteryWord wordId="canopy" word="canopy" />);

    const button = screen.getByRole("button", { name: /Hear canopy/i });
    await user.click(button);
    expect(playWordAudio).toHaveBeenCalledWith("canopy");
  });

  it("renders plain, non-interactive text when no clip exists", () => {
    mockedCanPlay.mockReturnValue(false);
    render(<SpeakableMysteryWord wordId="mystery" word="mystery" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});
