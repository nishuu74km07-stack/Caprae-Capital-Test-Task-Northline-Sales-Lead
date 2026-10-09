import { cx } from "@/lib/cx";

export function Meter({
  value,
  max,
  tone = "strong",
  className,
}: {
  value: number;
  max: number;
  tone?: "flat" | "strong";
  className?: string;
}) {
  const width = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cx("mt-1.5 h-2.5 overflow-hidden rounded-full bg-canvas-2", className)}>
      <span
        className={cx(
          "block h-full origin-left animate-bar rounded-full",
          tone === "strong" ? "bg-gradient-to-r from-[#18a2ad] to-teal" : "bg-[#9eb4bb]",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
