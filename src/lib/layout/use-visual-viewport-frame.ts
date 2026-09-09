"use client";

import { useLayoutEffect, type RefObject } from "react";

import {
  applyVisualViewportFrame,
  clearVisualViewportFrame,
} from "@/lib/layout/visual-viewport-frame";

/** Keep a fixed overlay frame aligned with the visible viewport while it is mounted. */
export function useVisualViewportFrame(
  frameRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const node = frameRef.current;
    const viewport = window.visualViewport;
    if (!node || !viewport) return;

    const sync = () => {
      applyVisualViewportFrame(node, viewport);
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      clearVisualViewportFrame(node);
    };
  }, [frameRef]);
}
