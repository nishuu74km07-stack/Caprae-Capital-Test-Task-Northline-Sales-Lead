export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-line bg-surface p-8 shadow-[var(--shadow-card)]">
      <h2 className="text-[30px]">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
    </div>
  );
}
