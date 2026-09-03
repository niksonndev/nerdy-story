import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ComprehensionChallengeOverlay } from "@/components/story/ComprehensionChallengeOverlay";
import { comprehensionChallenges } from "@/lib/story-data";
import type { ChallengePhase } from "@/lib/story/types";

const trackClues = comprehensionChallenges["track-clues"];

function renderComp(
  overrides: Partial<{
    open: boolean;
    phase: ChallengePhase;
    value: string;
    missReason: string | null;
    hintText: string | null;
    acceptedReason: string | null;
    onChange: (value: string) => void;
    onCheck: () => void;
    onContinue: () => void;
    onClose: () => void;
  }> = {},
) {
  const onChange = overrides.onChange ?? vi.fn();
  const onCheck = overrides.onCheck ?? vi.fn();
  const onContinue = overrides.onContinue ?? vi.fn();
  const onClose = overrides.onClose ?? vi.fn();

  render(
    <ComprehensionChallengeOverlay
      open={overrides.open ?? true}
      challenge={trackClues}
      phase={overrides.phase ?? "prompt"}
      value={overrides.value ?? ""}
      missReason={overrides.missReason ?? null}
      hintText={overrides.hintText ?? null}
      acceptedReason={overrides.acceptedReason ?? null}
      onChange={onChange}
      onCheck={onCheck}
      onContinue={onContinue}
      onClose={onClose}
    />,
  );

  return { onChange, onCheck, onContinue, onClose };
}

describe("ComprehensionChallengeOverlay", () => {
  it("renders nothing when closed", () => {
    renderComp({ open: false });
    expect(
      screen.queryByRole("dialog", { name: "Story question" }),
    ).not.toBeInTheDocument();
  });

  it("shows the question and disables Check until typed", () => {
    renderComp();

    expect(
      screen.getByRole("heading", { name: trackClues.question }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Your answer to the story question/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderComp();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits via Check when the field has a value", async () => {
    const user = userEvent.setup();
    const { onCheck } = renderComp({ value: "scratched bark and fur" });

    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it("shows miss chrome with reason and hint", () => {
    renderComp({
      missReason: "This part is about clues on the branch, not birds.",
      hintText: "Look again at what Grandpa Elias noticed on the branch.",
    });

    expect(screen.getByText("Try another idea!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This part is about clues on the branch, not birds.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hint:/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Look again at what Grandpa Elias noticed on the branch/,
      ),
    ).toBeInTheDocument();
  });

  it("shows the waiting puzzle state", () => {
    renderComp({ phase: "waiting" });
    expect(
      screen.getByText("Connecting the thoughts..."),
    ).toBeInTheDocument();
  });

  it("shows accepted feedback and Keep going calls onContinue", async () => {
    const user = userEvent.setup();
    const { onContinue, onClose } = renderComp({
      phase: "accepted",
      acceptedReason: "Yes — those clues showed a sloth had been there.",
    });

    expect(screen.getByText("You got it!")).toBeInTheDocument();
    expect(
      screen.getByText("Yes — those clues showed a sloth had been there."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep going" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows answer reveal and Got it calls onContinue", async () => {
    const user = userEvent.setup();
    const { onContinue, onClose } = renderComp({ phase: "reveal" });

    expect(screen.getByText(/Here's the idea/i)).toBeInTheDocument();
    expect(screen.getByText(trackClues.answerReveal)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
