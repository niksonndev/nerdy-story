"use client";

import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { type StoryChoice } from "@/lib/story/story-data";
import { cn } from "@/lib/utils";

type BranchChoiceProps = {
  choice: StoryChoice;
  disabled?: boolean;
  onChoose: (nextPageId: string) => void;
  className?: string;
};

export function BranchChoice({
  choice,
  disabled = false,
  onChoose,
  className,
}: BranchChoiceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <p className="text-center font-heading text-lg font-semibold text-foreground sm:text-left">
        {choice.prompt}
      </p>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {choice.options.map((option, index) => (
          <motion.div
            key={option.nextPageId}
            whileTap={
              disabled || reduceMotion ? undefined : { scale: 0.96 }
            }
            className="flex-1"
          >
            <Button
              size="kid"
              variant={index === 0 ? "default" : "secondary"}
              className="h-auto min-h-14 w-full whitespace-normal px-5 py-3 text-center leading-snug"
              disabled={disabled}
              onClick={() => onChoose(option.nextPageId)}
            >
              {option.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
