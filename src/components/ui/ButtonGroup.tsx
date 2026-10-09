import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Layout wrapper for shared Button rows (page actions, filters, drawer actions). */
export function ButtonGroup({
  children,
  align = "start",
  className,
}: {
  children: ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap gap-2",
        align === "end" && "justify-end",
        align === "between" && "items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
