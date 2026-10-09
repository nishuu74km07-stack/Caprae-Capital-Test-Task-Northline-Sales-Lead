import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone = "good" | "warn" | "muted" | "bad";

const tones: Record<BadgeTone, string> = {
  good: "border-[#bfe3cd] bg-good-bg text-good",
  warn: "border-[#f0d7a8] bg-warn-bg text-warn",
  muted: "border-line bg-muted-bg text-muted",
  bad: "border-[#f0c2bc] bg-bad-bg text-bad",
};

export function Badge({ tone = "muted", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex min-h-[26px] items-center whitespace-nowrap rounded-lg border px-2.5 text-xs font-bold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
