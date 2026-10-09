export function PanelHead({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="mb-3.5">
      <h2 className="text-[30px] leading-none">{title}</h2>
      {lede ? <p className="mt-1.5 text-[13px] text-muted">{lede}</p> : null}
    </div>
  );
}
