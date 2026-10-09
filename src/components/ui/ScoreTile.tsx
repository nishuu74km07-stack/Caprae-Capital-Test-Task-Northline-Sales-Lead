import { cx } from "@/lib/cx";

export function ScoreTile({ value, label, large = true }: { value: string; label: string; large?: boolean }) {
  return (
    <div className="rounded-[14px] border border-line bg-gradient-to-b from-[#f4fbfc] to-[#eef5f6] px-3 py-3.5">
      <p className={cx("font-display leading-none tracking-tight text-ink", large ? "text-[38px]" : "text-[22px]")}>
        {value}
      </p>
      <p className="mt-1.5 text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}
