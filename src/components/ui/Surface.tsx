import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

type SurfaceProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  lift?: boolean;
};

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Surface({ as: Tag = "div", children, className, padding = "md", lift = false }: SurfaceProps) {
  return (
    <Tag
      className={cx(
        "rounded-[18px] border border-line bg-surface shadow-[var(--shadow-card)]",
        paddings[padding],
        lift && "shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
