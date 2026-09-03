import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";

function DialogHarness({
  onClose = vi.fn(),
}: {
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useDialogA11y({
    open,
    onClose: () => {
      onClose();
      setOpen(false);
    },
    containerRef: dialogRef,
    initialFocusRef: inputRef,
  });

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open challenge
      </button>
      <button type="button">Outside chrome</button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Test dialog"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            Close
          </button>
          <textarea ref={inputRef} aria-label="Your idea" />
          <button type="button">Check</button>
        </div>
      ) : null}
    </div>
  );
}

describe("useDialogA11y", () => {
  it("moves focus into the dialog on open and restores it to the trigger on close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);

    const trigger = screen.getByRole("button", { name: "Open challenge" });
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByLabelText("Your idea")).toHaveFocus();
    });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("traps Tab within the dialog controls", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.click(screen.getByRole("button", { name: "Open challenge" }));

    const close = screen.getByRole("button", { name: "Close" });
    const answer = screen.getByLabelText("Your idea");
    const check = screen.getByRole("button", { name: "Check" });
    const outside = screen.getByRole("button", { name: "Outside chrome" });

    await waitFor(() => {
      expect(answer).toHaveFocus();
    });

    await user.tab();
    expect(check).toHaveFocus();

    await user.tab();
    expect(close).toHaveFocus();
    expect(outside).not.toHaveFocus();

    await user.tab();
    expect(answer).toHaveFocus();

    await user.tab({ shift: true });
    expect(close).toHaveFocus();
  });
});
