"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Chapter2Stub({ onReadAgain }: { onReadAgain: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col text-center sm:max-w-none",
        "max-sm:min-h-0 max-sm:flex-1",
        "sm:flex-none",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          "gap-[clamp(1rem,4dvh,3rem)]",
          "sm:gap-6",
        )}
      >
        <header className="shrink-0">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="mx-auto text-5xl sm:text-6xl"
            aria-hidden
          >
            {"\uD83D\uDCDA"}
          </motion.div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-magic-ink sm:text-5xl">
            Chapter 2 unlocked!
          </h1>
        </header>

        <section
          aria-label="Chapter 2 preview"
          className={cn(
            "py-[clamp(1rem,3vh,1.5rem)]",
            "sm:py-6",
          )}
        >
          <p className="mx-auto max-w-md text-lg leading-relaxed text-foreground/90 sm:text-2xl">
            Mia&apos;s next adventure is ready. More rainforest trails, more
            words to discover — coming soon!
          </p>
        </section>
      </div>

      <footer
        className={cn(
          "flex w-full shrink-0 flex-col gap-3",
          "max-sm:pt-4",
          "pb-[max(2rem,env(safe-area-inset-bottom))]",
          "sm:mt-4 sm:pt-0 sm:pb-0",
        )}
      >
        <Button
          size="kid"
          variant="outline"
          className="w-full min-h-14 border-foreground/25 text-xl sm:w-auto sm:self-center sm:text-2xl"
          onClick={onReadAgain}
        >
          Read the chapter again
        </Button>
      </footer>
    </motion.div>
  );
}
