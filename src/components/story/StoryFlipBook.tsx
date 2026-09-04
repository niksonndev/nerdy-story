"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const FLIPPING_MS = 500;

type HTMLFlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    turnToNextPage: () => void;
    turnToPrevPage: () => void;
    getCurrentPageIndex: () => number;
  } | null;
};

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-1 items-center justify-center bg-card/40" />
  ),
});

export type StoryFlipBookHandle = {
  flipNext: () => boolean;
  flipPrev: () => boolean;
};

type StoryFlipBookProps = {
  /** Remount key — typically the current story page id. */
  bookKey: string;
  sheetIds: string[];
  currentIndex: number;
  renderSheet: (pageId: string, isCurrent: boolean) => ReactNode;
  onFlipTo: (pageId: string, direction: "forward" | "back") => void;
  onFlippingChange?: (flipping: boolean) => void;
  className?: string;
};

/**
 * Portrait single-sheet flip book. Turns are button-driven only (Next Page /
 * Previous / branch) — no corner-drag or click-to-flip. Reduced motion uses
 * instant turnTo* instead of flip*.
 */
export const StoryFlipBook = forwardRef<
  StoryFlipBookHandle,
  StoryFlipBookProps
>(function StoryFlipBook(
  {
    bookKey,
    sheetIds,
    currentIndex,
    renderSheet,
    onFlipTo,
    onFlippingChange,
    className,
  },
  ref,
) {
  const bookRef = useRef<HTMLFlipBookHandle>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const reduceMotion = useReducedMotion();
  const sheetIdsRef = useRef(sheetIds);
  const currentIndexRef = useRef(currentIndex);
  const onFlipToRef = useRef(onFlipTo);
  const onFlippingChangeRef = useRef(onFlippingChange);
  sheetIdsRef.current = sheetIds;
  currentIndexRef.current = currentIndex;
  onFlipToRef.current = onFlipTo;
  onFlippingChangeRef.current = onFlippingChange;

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    flipNext() {
      const flip = bookRef.current?.pageFlip?.();
      if (!flip) {
        onFlippingChangeRef.current?.(false);
        return false;
      }
      onFlippingChangeRef.current?.(true);
      try {
        if (reduceMotion) {
          flip.turnToNextPage();
        } else {
          flip.flipNext("bottom");
        }
        return true;
      } catch {
        onFlippingChangeRef.current?.(false);
        return false;
      }
    },
    flipPrev() {
      // flipPrev() is a no-op with disableFlipByClick in portrait (left-edge
      // point fails the corner check). turnToPrevPage still fires `flip`.
      const flip = bookRef.current?.pageFlip?.();
      if (!flip) {
        onFlippingChangeRef.current?.(false);
        return false;
      }
      onFlippingChangeRef.current?.(true);
      try {
        flip.turnToPrevPage();
        return true;
      } catch {
        onFlippingChangeRef.current?.(false);
        return false;
      }
    },
  }));

  function handleFlip(e: { data: number }) {
    const nextIndex = e.data;
    const ids = sheetIdsRef.current;
    const fromIndex = currentIndexRef.current;
    const pageId = ids[nextIndex];
    if (!pageId || nextIndex === fromIndex) {
      onFlippingChangeRef.current?.(false);
      return;
    }
    onFlipToRef.current(pageId, nextIndex > fromIndex ? "forward" : "back");
    onFlippingChangeRef.current?.(false);
  }

  function handleChangeState(e: { data: string }) {
    if (e.data === "flipping" || e.data === "user_fold") {
      onFlippingChangeRef.current?.(true);
    } else if (e.data === "read") {
      const flip = bookRef.current?.pageFlip?.();
      if (flip && flip.getCurrentPageIndex() === currentIndexRef.current) {
        onFlippingChangeRef.current?.(false);
      }
    }
  }

  const sized = size.width > 0 && size.height > 0;

  return (
    <div
      ref={measureRef}
      className={cn(
        "relative min-h-0 w-full flex-1 overflow-hidden",
        className,
      )}
    >
      {sized ? (
        <HTMLFlipBook
          key={bookKey}
          ref={bookRef}
          className="story-flip-book"
          style={{ width: "100%", height: "100%" }}
          width={size.width}
          height={size.height}
          size="stretch"
          minWidth={size.width}
          maxWidth={size.width}
          minHeight={size.height}
          maxHeight={size.height}
          drawShadow={!reduceMotion}
          flippingTime={reduceMotion ? 1 : FLIPPING_MS}
          usePortrait
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.4}
          showCover={false}
          mobileScrollSupport
          clickEventForward
          useMouseEvents={false}
          swipeDistance={40}
          showPageCorners={false}
          disableFlipByClick
          startPage={currentIndex}
          renderOnlyPageLengthChange
          onFlip={handleFlip}
          onChangeState={handleChangeState}
        >
          {sheetIds.map((pageId, index) => (
            <FlipSheet key={`${bookKey}-${pageId}-${index}`}>
              {renderSheet(pageId, index === currentIndex)}
            </FlipSheet>
          ))}
        </HTMLFlipBook>
      ) : null}
    </div>
  );
});

const FlipSheet = forwardRef<
  HTMLDivElement,
  { children: ReactNode }
>(function FlipSheet({ children }, ref) {
  return (
    <div
      ref={ref}
      className="h-full w-full overflow-hidden bg-card"
    >
      {children}
    </div>
  );
});

export { FLIPPING_MS };
