import { type ReactNode } from "react";

type ChallengeWaitingStateProps = {
  text: string;
  children: ReactNode;
};

export function ChallengeWaitingState({
  text,
  children,
}: ChallengeWaitingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center py-8 text-center"
    >
      <div aria-hidden className="relative h-44 w-52 sm:h-52 sm:w-60">
        {children}
      </div>
      <p className="mt-4 font-heading text-xl font-semibold text-foreground">
        {text}
      </p>
    </div>
  );
}
