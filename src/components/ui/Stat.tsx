export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article className="rounded-[14px] border border-line bg-surface px-4 pb-3.5 pt-[18px] shadow-[var(--shadow-card)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2.5 font-display text-[40px] leading-none tracking-tight text-ink">{value}</p>
      {detail ? <p className="mt-2.5 text-[13px] leading-snug text-muted">{detail}</p> : null}
    </article>
  );
}
