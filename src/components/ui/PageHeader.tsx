import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-[18px] md:flex-row md:items-end">
      <div>
        {kicker ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-teal">{kicker}</p>
        ) : null}
        <h1 className="max-w-none text-[clamp(34px,5vw,52px)] leading-[0.96] md:max-w-[14ch]">{title}</h1>
        {lede ? <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
