import type { ReactNode } from "react";

export function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <strong className="font-semibold">{value}</strong>
    </div>
  );
}

export function FactList({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}
