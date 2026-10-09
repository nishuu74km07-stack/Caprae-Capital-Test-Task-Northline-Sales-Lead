import { cx } from "@/lib/cx";

export function SectionHeading({ children, className }: { children: string; className?: string }) {
  return <h3 className={cx("mb-2.5 font-display text-xl tracking-tight", className)}>{children}</h3>;
}
