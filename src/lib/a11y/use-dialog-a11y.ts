"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest("[aria-hidden='true']")) return false;
    if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") {
      return false;
    }
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({
        checkOpacity: false,
        checkVisibilityCSS: true,
      });
    }
    return !el.hasAttribute("hidden");
  });
}

type UseDialogA11yOptions = {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  /** Preferred focus target when the dialog opens (e.g. textarea). */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Focus trap, Escape-to-close, and restore focus to the trigger on dismiss.
 */
export function useDialogA11y({
  open,
  onClose,
  containerRef,
  initialFocusRef,
}: UseDialogA11yOptions) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      wasOpenRef.current = true;

      const frame = requestAnimationFrame(() => {
        const preferred = initialFocusRef?.current;
        if (preferred) {
          preferred.focus();
          return;
        }
        const container = containerRef.current;
        if (!container) return;
        const focusables = getFocusableElements(container);
        focusables[0]?.focus();
      });

      return () => cancelAnimationFrame(frame);
    }

    if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      const previous = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
    }
  }, [open, containerRef, initialFocusRef]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, containerRef]);
}

/** Shared close-control chrome for story dialogs (≥44px + focus ring). */
export const dialogCloseButtonClassName =
  "absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
