import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VocabularyChallengeOverlay } from "@/components/story/VocabularyChallengeOverlay";
import { playWordAudio, stopWordAudio } from "@/lib/speech/play-word-audio";
import { mysteryWords } from "@/lib/story/story-data";
import type { ChallengePhase } from "@/lib/story/types";

vi.mock("@/lib/speech/play-word-audio", () => ({
  canPlayMysteryWord: () => true,
  playWordAudio: vi.fn(),
  stopWordAudio: vi.fn(),
  mysteryWordAudioSrc: (wordId: string) => `/audio/mystery-words/${wordId}.mp3`,
}));

const canopy = mysteryWords.canopy;

beforeEach(() => {
  vi.clearAllMocks();
});

function renderVocabulary(
  overrides: Partial<{
    open: boolean;
    phase: ChallengePhase;
    value: string;
    missReason: string | null;
    hintText: string | null;
    acceptedReason: string | null;
    onChange: (value: string) => void;
    onCheck: () => void;
    onClose: () => void;
  }> = {},
) {
  const onChange = overrides.onChange ?? vi.fn();
  const onCheck = overrides.onCheck ?? vi.fn();
  const onClose = overrides.onClose ?? vi.fn();

  render(
    <VocabularyChallengeOverlay
      open={overrides.open ?? true}
      word={canopy}
      phase={overrides.phase ?? "prompt"}
      value={overrides.value ?? ""}
      missReason={overrides.missReason ?? null}
      hintText={overrides.hintText ?? null}
      acceptedReason={overrides.acceptedReason ?? null}
      onChange={onChange}
      onCheck={onCheck}
      onClose={onClose}
    />,
  );

  return { onChange, onCheck, onClose };
}

describe("VocabularyChallengeOverlay", () => {
  it("renders nothing when closed", () => {
    renderVocabulary({ open: false });
    expect(
      screen.queryByRole("dialog", { name: /Word challenge/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the mystery word and disables Check until typed", async () => {
    const user = userEvent.setup();
    const { onChange } = renderVocabulary();

    expect(
      screen.getByRole("button", { name: /Hear canopy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explain what you understand by/i),
    ).toBeInTheDocument();

    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toBeDisabled();

    await user.type(
      screen.getByLabelText(/Your idea for canopy/i),
      "leafy roof",
    );
    expect(onChange).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderVocabulary();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits via Check when the field has a value", async () => {
    const user = userEvent.setup();
    const { onCheck } = renderVocabulary({ value: "leafy roof" });

    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it("shows miss chrome with reason and hint", () => {
    renderVocabulary({
      missReason:
        "Canopy is about treetops high in the forest, not exactly about fruit.",
      hintText: "Think about the very top of the forest.",
    });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Try another idea!");
    expect(status).toHaveTextContent(
      "Canopy is about treetops high in the forest, not exactly about fruit.",
    );
    expect(status).toHaveTextContent(/Hint:/);
    expect(status).toHaveTextContent(/Think about the very top of the forest/);
  });

  it("shows the waiting dictionary state", () => {
    renderVocabulary({ phase: "waiting" });
    expect(
      screen.getByText("Checking the dictionary..."),
    ).toBeInTheDocument();
  });

  it("shows accepted feedback and Keep reading calls onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderVocabulary({
      phase: "accepted",
      acceptedReason: "Yes — canopy is about the leafy roof.",
    });

    expect(screen.getByText("You got it!")).toBeInTheDocument();
    expect(
      screen.getByText("Yes — canopy is about the leafy roof."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep reading" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("plays the word clip when the mystery word is tapped", async () => {
    const user = userEvent.setup();
    renderVocabulary();

    await user.click(screen.getByRole("button", { name: /Hear canopy/i }));
    expect(playWordAudio).toHaveBeenCalledWith(canopy.id);
  });

  it("stops any word playback when the overlay closes", () => {
    const { rerender } = render(
      <VocabularyChallengeOverlay
        open
        word={canopy}
        phase="prompt"
        value=""
        missReason={null}
        hintText={null}
        acceptedReason={null}
        onChange={vi.fn()}
        onCheck={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(stopWordAudio).not.toHaveBeenCalled();

    rerender(
      <VocabularyChallengeOverlay
        open={false}
        word={canopy}
        phase="prompt"
        value=""
        missReason={null}
        hintText={null}
        acceptedReason={null}
        onChange={vi.fn()}
        onCheck={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(stopWordAudio).toHaveBeenCalled();
  });

  it("shows meaning reveal and Got it calls onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderVocabulary({ phase: "reveal" });

    expect(screen.getByText(/Here's what it means/i)).toBeInTheDocument();
    expect(screen.getByText(canopy.meaningReveal)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
