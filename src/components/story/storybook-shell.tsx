import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const STORYBOOK_FRAME_CLASS =
  "relative flex min-h-0 flex-1 flex-col overflow-x-hidden";

export const STORYBOOK_CARD_CLASS =
  "relative z-10 w-full sm:mx-auto sm:flex-none sm:overflow-hidden sm:rounded-3xl sm:bg-card";

export function StorybookShell({
  children,
  chrome,
  frameClassName,
  cardClassName,
  cardAriaLabel,
  cardAs: Card = "article",
}: {
  children: ReactNode;
  chrome?: ReactNode;
  frameClassName?: string;
  cardClassName?: string;
  cardAriaLabel?: string;
  cardAs?: "article" | "div";
}) {
  return (
    <div className={cn(STORYBOOK_FRAME_CLASS, frameClassName)}>
      {chrome}
      <Card
        aria-label={cardAriaLabel}
        className={cn(STORYBOOK_CARD_CLASS, cardClassName)}
      >
        {children}
      </Card>
    </div>
  );
}
