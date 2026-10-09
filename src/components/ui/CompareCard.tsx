import { cx } from "@/lib/cx";
import { Meter } from "./Meter";

export function CompareCard({
  label,
  value,
  hint,
  budget,
  tone,
  win = false,
}: {
  label: string;
  value: number;
  hint: string;
  budget: number;
  tone: "flat" | "strong";
  win?: boolean;
}) {
  return (
    <article
      className={cx(
        "grid gap-2 rounded-[18px] border border-line bg-white/85 p-4",
        win && "border-teal/35 bg-gradient-to-b from-white to-[#e8f7f8] shadow-[0_14px_28px_rgba(14,124,134,0.12)]",
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-[52px] leading-none tracking-tight">{value}</p>
      <p className="min-h-[2.6em] text-[13px] leading-snug text-muted">{hint}</p>
      <Meter value={value} max={budget} tone={tone} />
    </article>
  );
}
