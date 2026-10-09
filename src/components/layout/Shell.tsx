"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useWorkspace } from "@/store/useWorkspace";
import { cx } from "@/lib/cx";
import { Button } from "@/components/ui";

const NAV = [
  { href: "/", label: "Desk", hint: "Credit impact" },
  { href: "/leads", label: "Leads", hint: "Ranked queue" },
  { href: "/buy-box", label: "Buy box", hint: "Fit criteria" },
  { href: "/import", label: "Import", hint: "Bring lists in" },
  { href: "/system", label: "System", hint: "Why + stack" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspace, loading, error, notice, dismissNotice, reload } = useWorkspace();
  const credits = workspace?.stats.credits;

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[268px_1fr]">
      <aside className="relative flex h-auto flex-col gap-3.5 border-r border-white/5 bg-[linear-gradient(180deg,rgba(14,124,134,0.22),transparent_28%),linear-gradient(160deg,var(--color-sidebar)_0%,var(--color-sidebar-mid)_100%)] p-4 text-sidebar-text md:sticky md:top-0 md:h-screen md:gap-7 md:px-[18px] md:pb-[22px] md:pt-7">
        <div className="flex items-center gap-3">
          <span
            className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-gradient-to-br from-[#18a2ad] via-teal to-[#086068] font-display text-2xl text-white shadow-[0_10px_24px_rgba(14,124,134,0.35)]"
            aria-hidden
          >
            N
          </span>
          <div>
            <p className="font-display text-[30px] leading-none tracking-tight">Northline</p>
            <p className="mt-1 text-xs font-medium text-sidebar-dim">Fit-first lead desk</p>
          </div>
        </div>

        <nav className="grid grid-cols-5 gap-1.5 md:grid-cols-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "grid gap-0.5 rounded-xl border border-transparent px-2 py-2.5 text-center text-sidebar-dim no-underline transition md:px-3.5 md:text-left",
                  active
                    ? "border-[rgba(216,241,243,0.18)] bg-teal/20 text-white"
                    : "hover:bg-white/5 hover:text-white",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-[13px] font-semibold md:text-[15px]">{item.label}</span>
                <small className="hidden text-xs opacity-70 md:block">{item.hint}</small>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden rounded-2xl border border-white/10 bg-black/20 p-4 md:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sidebar-dim">Credit budget</p>
          <p className="mt-1.5 font-display text-[42px] leading-none tracking-tight">{credits ? `${credits.remaining}` : "—"}</p>
          <p className="mt-1.5 text-[13px] text-sidebar-dim">
            {credits ? `${credits.used} spent of ${credits.allowance}` : "Loading…"}
          </p>
        </div>
        <p className="hidden text-xs leading-relaxed text-sidebar-dim md:block">
          Built for the SaaSquatch workflow: scrape wide, enrich only the owners who fit.
        </p>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 px-4 pt-[18px] md:px-8">
          <div>
            <p className="text-sm font-bold">{workspace?.buyBox.firmName ?? "Northline Search"}</p>
            <p className="mt-0.5 text-xs text-muted">Searcher desk · fictional demo data</p>
          </div>
          <div
            className={cx(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold shadow-[var(--shadow-card)]",
              credits && credits.remaining <= 5
                ? "border-[#f0d7a8] bg-warn-bg text-warn"
                : "border-line bg-surface text-teal-ink",
            )}
          >
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-teal" aria-hidden />
            {credits ? `${credits.remaining} credits left` : "Loading credits"}
          </div>
        </div>

        {notice ? (
          <div
            className="mx-4 mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-[#bfe3cd] bg-good-bg px-3.5 py-3 text-good animate-rise md:mx-8"
            role="status"
          >
            <span>{notice}</span>
            <Button variant="ghost" size="sm" onClick={dismissNotice}>
              Dismiss
            </Button>
          </div>
        ) : null}

        {error ? (
          <div
            className="mx-4 mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-[#f0c2bc] bg-bad-bg px-3.5 py-3 text-bad animate-rise md:mx-8"
            role="alert"
          >
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => void reload()}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="mx-auto max-w-[1180px] animate-rise px-4 pb-12 pt-[18px] md:px-8">
          {loading && !workspace ? (
            <div className="flex items-center gap-3 pt-10 font-semibold text-muted">
              <span className="h-[18px] w-[18px] animate-spin-slow rounded-full border-2 border-line border-t-teal" aria-hidden />
              Loading the desk…
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
