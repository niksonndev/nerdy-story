"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/** Matches `SceneImage` so cover preload hits the same `/_next/image` URLs. */
export const SCENE_IMAGE_SIZES = "(min-width: 640px) 900px, 100vw";

type SceneImageProps = {
  src?: string;
  alt: string;
  backControl?: ReactNode;
};

/** Off-screen but real layout — 0×0 `fill` boxes do not load the banner candidate. */
export function SceneImagePreload({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 left-full z-[-1] w-screen sm:w-225"
    >
      <div className="relative aspect-4/5 w-full sm:aspect-7/3">
        <Image
          src={src}
          alt=""
          fill
          sizes={SCENE_IMAGE_SIZES}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

export function SceneImage({ src, alt, backControl }: SceneImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const waiting = Boolean(src) && loadedSrc !== src;

  return (
    <div
      className={cn(
        "relative w-full shrink-0 self-start overflow-hidden",
        !waiting && "bg-magic/10",
        "max-sm:aspect-4/5 max-sm:max-h-[40vh]",
        "sm:aspect-7/3 sm:h-auto sm:w-full",
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={SCENE_IMAGE_SIZES}
          className={cn("object-cover", waiting && "opacity-0")}
          priority
          onLoad={() => setLoadedSrc(src)}
        />
      ) : null}
      {backControl}
    </div>
  );
}
