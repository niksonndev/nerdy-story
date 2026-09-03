"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  COVER_DOLLY_MS,
  StoryCoverView,
} from "@/components/story/StoryCoverView";
import { cn } from "@/lib/utils";

type StoryCoverEntranceProps = {
  isTransitioning: boolean;
  onStartReading: () => void;
  onEntranceComplete: () => void;
};

export function StoryCoverEntrance({
  isTransitioning,
  onStartReading,
  onEntranceComplete,
}: StoryCoverEntranceProps) {
  const reduceMotion = useReducedMotion();
  const fadeMs = reduceMotion ? 0 : COVER_DOLLY_MS;

  return (
    <motion.div
      data-cover-entrance
      className={cn(
        "flex flex-1 flex-col",
        isTransitioning && "pointer-events-none absolute inset-0 z-20",
      )}
      initial={false}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{
        duration: fadeMs / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <StoryCoverView
        isTransitioning={isTransitioning}
        onStartReading={onStartReading}
        onTransitionComplete={onEntranceComplete}
      />
    </motion.div>
  );
}

export function useStoryEntrance() {
  const [isEntranceTransitioning, setIsEntranceTransitioning] = useState(false);

  function beginEntranceTransition() {
    if (isEntranceTransitioning) return;
    setIsEntranceTransitioning(true);
  }

  function completeEntranceTransition(onComplete: () => void) {
    onComplete();
    setIsEntranceTransitioning(false);
  }

  return {
    isEntranceTransitioning,
    beginEntranceTransition,
    completeEntranceTransition,
  };
}

/** Fades in page-1 underneath the cover during the dolly-in handoff. */
export function StoryEntrancePageLayer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
