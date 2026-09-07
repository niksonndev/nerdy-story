"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export function WordsLearned({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "relative z-10 flex items-center gap-2 rounded-full bg-magic/10 px-4 py-1.5",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center text-lg leading-none text-magic"
      >
        {"\u2728"}
      </span>
      <span className="translate-y-0.5 font-heading text-sm font-semibold uppercase leading-none tracking-wide text-magic-ink">
        Words learned
      </span>
      <div className="relative h-6 w-6 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={reduceMotion ? false : { y: 14, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { y: -14, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 500, damping: 24 }
            }
            className="absolute inset-0 font-heading text-lg font-bold text-magic"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
