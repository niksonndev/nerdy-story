"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { STORY_META } from "@/lib/story-data";
import { cn } from "@/lib/utils";

const DOLLY_MS = 700;
const CHROME_FADE_MS = 400;
const DOLLY_SCALE = 2.6;

type StoryCoverViewProps = {
  onStartReading: () => void;
  isTransitioning?: boolean;
  onTransitionComplete?: () => void;
};

export function StoryCoverView({
  onStartReading,
  isTransitioning = false,
  onTransitionComplete,
}: StoryCoverViewProps) {
  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const dollyMs = reduceMotion ? 0 : DOLLY_MS;
  const chromeFadeMs = reduceMotion ? 0 : CHROME_FADE_MS;

  const handleDollyComplete = useEffectEvent(() => {
    if (!isTransitioning || completedRef.current) return;
    completedRef.current = true;
    onTransitionComplete?.();
  });

  useEffect(() => {
    if (!isTransitioning) {
      completedRef.current = false;
      return;
    }
    if (!reduceMotion) return;
    const timer = window.setTimeout(() => {
      handleDollyComplete();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isTransitioning, reduceMotion]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-x-hidden",
        isTransitioning && "pointer-events-none",
        "max-sm:h-dvh",
        "lg:justify-center lg:py-8",
      )}
    >
      <article
        className={cn(
          "relative z-10 flex w-full flex-col",
          "min-h-0 max-sm:flex-1",
          "sm:mx-auto sm:mb-8 sm:mt-4 sm:max-w-175 sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card",
          "lg:my-auto lg:mt-0 lg:max-w-300",
        )}
      >
        <div className="flex min-h-0 flex-col max-sm:flex-1 lg:flex-row lg:items-stretch">
          <motion.div
            className={cn(
              "overflow-hidden bg-magic/10",
              isTransitioning
                ? "fixed inset-0 z-40 flex items-center justify-center"
                : cn(
                    "relative w-full shrink-0 self-start",
                    "aspect-4/5 max-sm:max-h-[40vh]",
                    "sm:aspect-3/1 sm:h-auto sm:w-full",
                    "lg:aspect-4/5 lg:w-[58%] lg:max-h-[85dvh] lg:max-w-none lg:self-auto",
                  ),
            )}
            style={isTransitioning ? { perspective: 1200 } : undefined}
          >
            <motion.div
              className={cn(
                "relative",
                isTransitioning
                  ? "h-[55vh] w-[85vw] max-w-md sm:h-[60vh] sm:w-[50vw]"
                  : "h-full w-full",
              )}
              initial={false}
              animate={
                isTransitioning
                  ? {
                      scale: reduceMotion ? 1 : DOLLY_SCALE,
                      opacity: 0,
                      z: reduceMotion ? 0 : 120,
                    }
                  : { scale: 1, opacity: 1, z: 0 }
              }
              transition={{
                duration: dollyMs / 1000,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={handleDollyComplete}
            >
              <Image
                src={STORY_META.coverImage}
                alt={STORY_META.coverImageAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 700px, (min-width: 640px) 900px, 100vw"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            className={cn(
              "flex min-w-0 flex-col px-5 pt-6",
              "min-h-0 max-sm:flex-1 max-sm:pb-0",
              "sm:flex-none sm:px-10 sm:pb-8 sm:pt-8",
              "lg:flex-1 lg:self-stretch lg:justify-between lg:px-8 lg:py-10",
            )}
            initial={false}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            transition={{ duration: chromeFadeMs / 1000, ease: "easeOut" }}
          >
            <div className="flex flex-col max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto">
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {STORY_META.title}
              </h1>

              <p className="mt-3 font-heading text-base font-semibold text-magic-ink sm:text-lg">
                Find mystery words along the way
              </p>

              <section className="mt-6" aria-label="Quick tips">
                <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/70">
                  Quick tips
                </h2>
                <ol className="mt-3 space-y-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                  <li className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-magic/15 font-heading text-sm font-bold text-magic-ink"
                    >
                      1
                    </span>
                    <span>Tap highlighted words to unlock their secrets</span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 font-heading text-sm font-bold text-secondary"
                    >
                      2
                    </span>
                    <span>
                      Make choices to help {STORY_META.protagonistName} on her
                      adventure!
                    </span>
                  </li>
                </ol>
              </section>
            </div>

            <div
              className={cn(
                "relative z-10 mt-6 flex w-full",
                "max-sm:mt-auto max-sm:shrink-0 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-4",
                "sm:mt-auto sm:pt-8",
                "lg:pt-8",
              )}
            >
              <Button
                size="kid"
                className="min-h-14 w-full sm:mx-auto sm:w-auto lg:mx-0"
                onClick={onStartReading}
                disabled={isTransitioning}
                aria-label="Start Reading"
              >
                Start Reading {"\u{1F4D6}"}
              </Button>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
